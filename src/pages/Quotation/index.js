import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"
import { DASHBOARD_NAME } from "../../config";
import { setBreadcrumbItems } from "../../store/actions"
import {
  deleteQuotationById,
  getCustomerList,
  getItemList,
  getQuotationById,
  getQuotationPages,
  saveQuotation,
} from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import QuotationForm from "./QuotationForm"
import ConvertToOrderForm from "./ConvertToOrderForm"

const QUOTATION_LIST_SORT_COLUMN = "quotationDate"
const QUOTATION_LIST_SORT_DIR = "desc"

const Quotations = props => {
    document.title = `Quotations | ${DASHBOARD_NAME}`
 // document.title = "Quotations | Lexa - Responsive Bootstrap 5 Admin Dashboard"
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const quotationId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/Quotation/manage")
  const isConvertPagePath = location.pathname.startsWith("/Quotation/convert-to-order")
  const isConvertPage = isConvertPagePath && quotationId > 0
  const isEditMode = isFormPage && quotationId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(QUOTATION_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(QUOTATION_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Quotation" : "Create Quotation")
  const [itemOptions, setItemOptions] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])
  const [formData, setFormData] = useState({
    quotationId: 0,
    customerId: "",
    quotationDate: new Date().toISOString().split("T")[0],
    totalAmount: 0,
    items: [],
  })
  const [convertFormData, setConvertFormData] = useState({
    quotationId: 0,
    customerId: "",
    customerName: "",
    quotationDate: "",
    totalAmount: 0,
    orderDate: new Date().toISOString(),
    items: [],
  })

  useEffect(() => {
    const pathParts = location.pathname.split("/")
    if (pathParts.includes("convert-to-order")) {
      const convertIndex = pathParts.indexOf("convert-to-order")
      const qId = Number(pathParts[convertIndex + 1]) || 0
      if (qId > 0) {
        loadQuotationForConvert(qId)
      } else {
        navigate("/Quotation")
      }
    }
  }, [location.pathname])

  const loadQuotationForConvert = async qId => {
    setLoading(true)
    setFormError("")
    setFormTitle("Convert to Order")

    try {
      const response = await getQuotationById(qId)
      if (!(response?.isSuccess)) {
        throw new Error(response?.message || "Failed to load quotation")
      }

      const quotation = response?.data || {}
      setConvertFormData({
        quotationId: quotation.quotationId || 0,
        customerId: quotation.customerId ?? "",
        customerName: quotation.customerName || "",
        quotationDate: quotation.quotationDate || "",
        totalAmount: quotation.totalAmount ?? 0,
        orderDate: new Date().toISOString(),
        items: Array.isArray(quotation.items) && quotation.items.length > 0
          ? quotation.items
          : [{ itemId: 0, itemName: "", quantity: 1, price: 0, amount: 0 }],
      })
    } catch (err) {
      setFormError(err?.message || err || "Failed to load quotation")
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Quotations", link: "#" },
  ]

  const loadQuotations = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getQuotationPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess)) {
        throw new Error(response?.message || "Failed to load quotations")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load quotations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Quotations")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadQuotations()
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
    const loadQuotation = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Quotation")
        setFormData({
          quotationId: 0,
          customerId: "",
          quotationDate: new Date().toISOString().split("T")[0],
          totalAmount: 0,
          items: [{ itemId: 0, itemName: "", quantity: 1, price: 0, amount: 0 }],
        })
        return
      }

      setLoading(true)

      try {
        const response = await getQuotationById(quotationId)
        if (!(response?.isSuccess)) {
          throw new Error(response?.message || "Failed to load quotation")
        }

        const quotation = response?.data || {}

        setFormTitle("Edit Quotation")
        setFormData({
          quotationId: quotation.quotationId || 0,
          customerId: quotation.customerId ?? "",
          quotationDate: quotation.quotationDate
            ? new Date(quotation.quotationDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          totalAmount: quotation.totalAmount ?? 0,
          items: Array.isArray(quotation.items) && quotation.items.length > 0
            ? quotation.items
            : [{ itemId: 0, itemName: "", quantity: 1, price: 0, amount: 0 }],
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load quotation")
      } finally {
        setLoading(false)
      }
    }

    loadQuotation()
  }, [isFormPage, isEditMode, quotationId])

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
        //  { label: "Quotation ID", field: "quotationId", sort: "asc" },
          { label: "Customer Name", field: "customerName", sort: "asc" },
          { label: "Quotation Date", field: "quotationDate", sort: "asc" },
          { label: "Total Amount", field: "totalAmount", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(quotation => ({
        quotationId: quotation.quotationId,
        customerName: quotation.customerName || "",
        quotationDate: quotation.quotationDate
          ? new Date(quotation.quotationDate).toLocaleDateString()
          : "",
        totalAmount: quotation.totalAmount ?? 0,
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => {
                if (quotation.isConvert === 1 || quotation.isConvert === true) {
                  showError("This quotation is converted to order so cannot update")
                  return
                }
                navigate(`/Quotation/manage/${quotation.quotationId}`)
              }}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            {(quotation.isConvert !== 1 && quotation.isConvert !== true) && (
              <Button
                color="link"
                className="p-0 text-success"
                title="Convert to Order"
                type="button"
                onClick={() => handleConvertToOrder(quotation)}
              >
                <i className="mdi mdi-cart-plus font-size-18" />
              </Button>
            )}
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === quotation.quotationId}
              onClick={() => {
                if (quotation.isConvert === 1 || quotation.isConvert === true) {
                  showError("You cannot delete this because it is converted to order")
                  return
                }
                handleDelete(quotation.quotationId)
              }}
            >
              {deletingId === quotation.quotationId ? (
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
    const isConfirmed = await showConfirm("Are you sure you want to delete this quotation?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteQuotationById(id)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Quotation deleted successfully")
        await loadQuotations()
        return
      }

      throw new Error(response?.message || "Failed to delete quotation")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete quotation"
      await showError(errorMessage)
    } finally {
      setDeletingId(0)
    }
  }

  const handleConvertToOrder = quotation => {
    navigate(`/Quotation/convert-to-order/${quotation.quotationId}`)
  }

  const handleConvertChange = event => {
    const { name, value } = event.target
    setConvertFormData(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleConvertItemChange = (index, event) => {
    const { name, value } = event.target
    const updatedItems = [...convertFormData.items]
    
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

    setConvertFormData(previous => ({
      ...previous,
      items: updatedItems,
    }))
  }

  const addConvertItem = () => {
    setConvertFormData(previous => ({
      ...previous,
      items: [
        ...previous.items,
        { itemId: 0, itemName: "", quantity: 1, price: 0, amount: 0 },
      ],
    }))
  }

  const removeConvertItem = index => {
    const updatedItems = convertFormData.items.filter((_, i) => i !== index)
    setConvertFormData(previous => ({
      ...previous,
      items: updatedItems,
    }))
  }

  const calculateConvertTotal = () => {
    return convertFormData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  }

  const handleConvertSubmit = async event => {
    event.preventDefault()
    setFormError("")

    setSaving(true)

    try {
      const payload = {
        quotationId: Number(convertFormData.quotationId) || 0,
        customerId: Number(convertFormData.customerId) || 0,
        quotationDate: new Date(convertFormData.quotationDate).toISOString(),
        totalAmount: calculateConvertTotal(),
        isConvert: true,
        orderDate: new Date(convertFormData.orderDate).toISOString(),
        items: convertFormData.items.map(item => ({
          itemId: Number(item.itemId) || 0,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          amount: Number(item.amount) || 0,
        })),
      }

      const response = await saveQuotation(payload)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Converted to order successfully")
        navigate("/Quotation")
        return
      }

      throw new Error(response?.message || "Failed to convert to order")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to convert to order"
      await showError(errorMessage)
      setFormError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError("")

    setSaving(true)

    try {
      const payload = {
        quotationId: isEditMode ? Number(formData.quotationId) || quotationId : 0,
        customerId: Number(formData.customerId) || 0,
        quotationDate: new Date(formData.quotationDate).toISOString(),
        totalAmount: calculateTotal(),
        items: formData.items.map(item => ({
          itemId: Number(item.itemId) || 0,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          amount: Number(item.amount) || 0,
        })),
      }

      const response = await saveQuotation(payload)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully")
        navigate("/Quotation")
        return
      }

      throw new Error(response?.message || "Failed to save quotation")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save quotation"
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
              <QuotationForm
                title={formTitle}
                formError={formError}
                formData={formData}
                itemOptions={itemOptions}
                customerOptions={customerOptions}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleChange}
                onItemChange={handleItemChange}
                onQuantityChange={handleQuantityChange}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onSubmit={handleSubmit}
                onClose={() => navigate("/Quotation")}
                calculateTotal={calculateTotal}
              />
            )
          ) : isConvertPage ? (
            loading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <ConvertToOrderForm
                title={formTitle}
                formError={formError}
                formData={convertFormData}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleConvertChange}
                onItemChange={handleConvertItemChange}
                onAddItem={addConvertItem}
                onRemoveItem={removeConvertItem}
                onSubmit={handleConvertSubmit}
                onClose={() => navigate("/Quotation")}
                calculateTotal={calculateConvertTotal}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/Quotation/manage")}>
                    <i className="mdi mdi-plus me-1" />Add Quotation
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

export default connect(null, { setBreadcrumbItems })(Quotations)