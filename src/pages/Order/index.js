import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"
import { DASHBOARD_NAME } from "../../config";
import { setBreadcrumbItems } from "../../store/actions"
import {
  deleteOrderById,
  getCustomerList,
  getItemList,
  getOrderById,
  getOrderPages,
  saveOrder,
} from "../../helpers/fakebackend_helper"
import { getLovDropdownList } from "../../helpers/api_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import OrderForm from "./OrderForm"

const ORDER_LIST_SORT_COLUMN = "orderDate"
const ORDER_LIST_SORT_DIR = "desc"

const Orders = props => {
    document.title = `Orders | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const orderId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/Order/manage")
  const isEditMode = isFormPage && orderId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(ORDER_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(ORDER_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Order" : "Create Order")
  const [itemOptions, setItemOptions] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])
  const [formData, setFormData] = useState({
    orderId: 0,
    customerId: "",
    orderDate: new Date().toISOString().split("T")[0],
    quotationId: "",
    status: "",
    totalAmount: 0,
    items: [],
  })
  const [statusOptions, setStatusOptions] = useState([])

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Orders", link: "#" },
  ]

  const loadOrders = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getOrderPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess)) {
        throw new Error(response?.message || "Failed to load orders")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Orders")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadOrders()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  useEffect(() => {
    const loadItemOptions = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getItemList()
        if (response?.isSuccess && Array.isArray(response?.data)) {
          setItemOptions(response.data)
          return
        }

        throw new Error(response?.message || "Failed to load items")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load items")
      }
    }

    loadItemOptions()
  }, [isFormPage])

  useEffect(() => {
    const loadCustomerOptions = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getCustomerList()
        if (response?.isSuccess && Array.isArray(response?.data)) {
          setCustomerOptions(response.data)
          return
        }

        throw new Error(response?.message || "Failed to load customers")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load customers")
      }
    }

    loadCustomerOptions()
  }, [isFormPage])

  useEffect(() => {
    const loadStatusOptions = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getLovDropdownList("OrderStatus")
        if (response?.isSuccess && Array.isArray(response?.data)) {
          setStatusOptions(response.data)
          return
        }

        throw new Error(response?.message || "Failed to load status")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load status")
      }
    }

    loadStatusOptions()
  }, [isFormPage])

  useEffect(() => {
    const loadOrder = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Order")
        setFormData({
          orderId: 0,
          customerId: "",
          orderDate: new Date().toISOString().split("T")[0],
          quotationId: "",
          totalAmount: 0,
          items: [{ itemId: 0, itemName: "", quantity: 1, price: 0, amount: 0 }],
        })
        return
      }

      setLoading(true)

      try {
        const response = await getOrderById(orderId)
        if (!(response?.isSuccess)) {
          throw new Error(response?.message || "Failed to load order")
        }

        const order = response?.data || {}

        setFormTitle("Edit Order")
        setFormData({
          orderId: order.orderId || 0,
          customerId: order.customerId ?? "",
          orderDate: order.orderDate
            ? new Date(order.orderDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          quotationId: order.quotationId ?? "",
          status: order.status || "",
          totalAmount: order.totalAmount ?? 0,
          items: Array.isArray(order.items) && order.items.length > 0
            ? order.items
            : [{ itemId: 0, itemName: "", quantity: 1, price: 0, amount: 0 }],
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load order")
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [isFormPage, isEditMode, orderId])

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Customer Name", field: "customerName", sort: "asc" },
          { label: "Order Date", field: "orderDate", sort: "asc" },
          { label: "Total Amount", field: "totalAmount", sort: "asc" },
        //  { label: "Quotation", field: "quotationId", sort: "asc" },
          { label: "Status", field: "statusname", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(order => ({
        orderId: order.orderId,
        customerName: order.customerName || "",
        orderDate: order.orderDate
          ? new Date(order.orderDate).toLocaleDateString()
          : "",
        totalAmount: order.totalAmount ?? 0,
        quotationId: order.quotationId || "-",
        statusname: order.statusname || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/Order/manage/${order.orderId}`)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === order.orderId}
              onClick={() => handleDelete(order.orderId)}
            >
              {deletingId === order.orderId ? (
                <Spinner size="sm" />
              ) : (
                <i className="mdi mdi-trash-can-outline font-size-18" />
              )}
            </Button>
          </div>
        ),
      })),
    })
  }, [rows, sortColumn, sortColumnDir, deletingId])

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleItemChange = (index, event) => {
    const { name, value } = event.target
    const updatedItems = [...formData.items]
    
    if (name === "itemSelected") {
      const itemData = JSON.parse(value || "{}")
      updatedItems[index] = {
        ...updatedItems[index],
        itemId: itemData.itemId || 0,
        itemName: itemData.itemName || "",
        price: itemData.price || 0,
        quantity: itemData.quantity || 1,
        amount: itemData.amount || 0,
      }
    } else if (name === "itemId") {
      updatedItems[index] = {
        ...updatedItems[index],
        itemId: Number(value) || 0,
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: name === "itemName" ? value : Number(value) || 0,
      }

      if (name === "quantity" || name === "price") {
        updatedItems[index].amount =
          (Number(updatedItems[index].quantity) || 0) * (Number(updatedItems[index].price) || 0)
      }
    }

    setFormData(previous => ({
      ...previous,
      items: updatedItems,
    }))
  }

  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...formData.items]
    let qty = Number(quantity) || 0
    if (qty < 1) qty = 1
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: qty,
      amount: qty * (Number(updatedItems[index].price) || 0),
    }
    setFormData(previous => ({
      ...previous,
      items: updatedItems,
    }))
  }

  const addItem = () => {
    setFormData(previous => ({
      ...previous,
      items: [
        ...previous.items,
        { itemId: 0, itemName: "", quantity: 1, price: 0, amount: 0 },
      ],
    }))
  }

  const removeItem = index => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData(previous => ({
      ...previous,
      items: updatedItems,
    }))
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  }

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this order?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteOrderById(id)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Order deleted successfully")
        await loadOrders()
        return
      }

      throw new Error(response?.message || "Failed to delete order")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete order"
      await showError(errorMessage)
    } finally {
      setDeletingId(0)
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError("")

    setSaving(true)

    try {
      const payload = {
        orderId: isEditMode ? Number(formData.orderId) || orderId : 0,
        customerId: Number(formData.customerId) || 0,
        orderDate: new Date(formData.orderDate).toISOString(),
        quotationId: Number(formData.quotationId) || 0,
        status: formData.status || "",
        totalAmount: calculateTotal(),
        items: formData.items.map(item => ({
          itemId: Number(item.itemId) || 0,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          amount: Number(item.amount) || 0,
        })),
      }

      const response = await saveOrder(payload)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully")
navigate("/Order")
        return
      }

      throw new Error(response?.message || "Failed to save order")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save order"
      await showError(errorMessage)
      setFormError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          {isFormPage ? (
            loading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <OrderForm
                title={formTitle}
                formError={formError}
                formData={formData}
                itemOptions={itemOptions}
                customerOptions={customerOptions}
                statusOptions={statusOptions}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleChange}
                onItemChange={handleItemChange}
                onQuantityChange={handleQuantityChange}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onSubmit={handleSubmit}
                onClose={() => navigate("/Order")}
                calculateTotal={calculateTotal}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/Order/manage")}>
                    <i className="mdi mdi-plus me-1" />Add Order
                  </Button>
                </div>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Orders)