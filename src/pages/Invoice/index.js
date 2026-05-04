import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, formatDate, getNextSortState, withAutoSrColumn } from "../../common/common"
import { DASHBOARD_NAME } from "../../config";
import { setBreadcrumbItems } from "../../store/actions"
import {
  deleteInvoiceById,
  getInvoiceById,
  getInvoicePages,
  getOrderById,
  getOrderDropdownList,
  saveInvoice,
} from "../../helpers/fakebackend_helper"
import { getLovDropdownList } from "../../helpers/api_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import InvoiceForm from "./InvoiceForm"

const INVOICE_LIST_SORT_COLUMN = "invoiceId"
const INVOICE_LIST_SORT_DIR = "desc"

const Invoices = props => {
  document.title = `Invoices | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const invoiceId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/Invoice/manage")
  const isEditMode = isFormPage && invoiceId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(INVOICE_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(INVOICE_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Invoice" : "Create Invoice")
  const [orderOptions, setOrderOptions] = useState([])
  const [invoiceTypeOptions, setInvoiceTypeOptions] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [formData, setFormData] = useState({
    invoiceId: 0,
    orderId: "",
    invoiceNumber: "",
    invoiceType: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Invoices", link: "#" },
  ]

  const loadInvoices = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getInvoicePages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess)) {
        throw new Error(response?.message || "Failed to load invoices")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Invoices")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadInvoices()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  useEffect(() => {
    const loadOrderOptions = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getOrderDropdownList()
        if (response?.isSuccess && Array.isArray(response?.data)) {
          const transformed = response.data.map(item => ({
            value: item.id,
            label: item.name,
          }))
          setOrderOptions(transformed)
          return
        }

        throw new Error(response?.message || "Failed to load orders")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load orders")
      }
    }

    loadOrderOptions()
  }, [isFormPage])

  useEffect(() => {
    const loadInvoiceTypeOptions = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getLovDropdownList("InvoiceType")
        if (response?.isSuccess && Array.isArray(response?.data)) {
          const transformed = response.data.map(item => ({
            value: item.code,
            label: item.name,
          }))
          setInvoiceTypeOptions(transformed)
          return
        }

        throw new Error(response?.message || "Failed to load invoice types")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load invoice types")
      }
    }

    loadInvoiceTypeOptions()
  }, [isFormPage])

  useEffect(() => {
    const loadOrderItems = async () => {
      if (!isFormPage || !formData.orderId) {
        setOrderItems([])
        return
      }

      try {
        const response = await getOrderById(formData.orderId)
        if (response?.isSuccess && response?.data) {
          console.log("getOrderById response", response)
          const items = response.data.items || []
          setOrderItems(items)
          setTotalAmount(response.data.totalAmount || 0)
          return
        }
        setOrderItems([])
        setTotalAmount(0)
      } catch (err) {
        setOrderItems([])
        setTotalAmount(0)
      }
    }

    loadOrderItems()
  }, [isFormPage, formData.orderId])

  useEffect(() => {
    const loadInvoice = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Invoice")
        setFormData({
          invoiceId: 0,
          orderId: "",
          invoiceNumber: "",
          invoiceType: "",
          invoiceDate: new Date().toISOString().split("T")[0],
          dueDate: new Date().toISOString().split("T")[0],
          notes: "",
        })
        return
      }

      setLoading(true)

      try {
        const response = await getInvoiceById(invoiceId)
        console.log("getInvoiceById response", response)
        if (!(response?.isSuccess)) {
          throw new Error(response?.message || "Failed to load invoice")
        }

        const invoice = response?.data || {}

        setFormTitle("Edit Invoice")
        setFormData({
          invoiceId: invoice.invoiceId || 0,
          orderId: invoice.orderId ?? "",
          invoiceNumber: invoice.invoiceNumber || "",
          invoiceType: invoice.invoiceType ?? "",
          invoiceDate: invoice.invoiceDate
            ? invoice.invoiceDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          dueDate: invoice.dueDate
            ? invoice.dueDate.split("T")[0]
            : new Date().toISOString().split("T")[0],
          notes: invoice.notes || "",
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load invoice")
      } finally {
        setLoading(false)
      }
    }

    loadInvoice()
  }, [isFormPage, isEditMode, invoiceId])

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Invoice No", field: "invoiceNumber", sort: "asc" },
          { label: "Customer Name", field: "customerName", sort: "asc" },
          { label: "Order No", field: "orderNo", sort: "asc" },
          { label: "Invoice Date", field: "invoiceDate", sort: "asc" },
          { label: "Due Date", field: "dueDate", sort: "asc" },
          { label: "Amount", field: "amount", sort: "asc" },
          { label: "Status", field: "status", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(invoice => ({
        invoiceId: invoice.invoiceId,
        invoiceNumber: invoice.invoiceNumber || "",
        customerName: invoice.customerName || "",
        orderNo: invoice.orderNo || "",
        invoiceDate: formatDate(invoice.invoiceDate),
        dueDate: formatDate(invoice.dueDate),
        amount: invoice.amount ?? 0,
        status: invoice.status || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => {
                navigate(`/Invoice/manage/${invoice.invoiceId}`)
              }}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === invoice.invoiceId}
              onClick={() => {
                handleDelete(invoice.invoiceId)
              }}
            >
              {deletingId === invoice.invoiceId ? (
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

  const handleOrderSelectChange = option => {
    setFormData(previous => ({
      ...previous,
      orderId: option ? option.value : "",
    }))
  }

  const handleInvoiceTypeSelectChange = option => {
    setFormData(previous => ({
      ...previous,
      invoiceType: option ? option.value : "",
    }))
  }

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this invoice?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteInvoiceById(id)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Invoice deleted successfully")
        await loadInvoices()
        return
      }

      throw new Error(response?.message || "Failed to delete invoice")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete invoice"
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
      const invoiceDateValue = formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : null
      const dueDateValue = formData.dueDate ? new Date(formData.dueDate).toISOString() : null

      const payload = {
        invoiceId: isEditMode ? Number(formData.invoiceId) || invoiceId : 0,
        orderId: Number(formData.orderId) || 0,
        invoiceNumber: formData.invoiceNumber || "",
        invoiceType: formData.invoiceType || "",
        invoiceDate: invoiceDateValue,
        dueDate: dueDateValue,
        notes: formData.notes || "",
      }

      const response = await saveInvoice(payload)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully")
        navigate("/Invoice")
        return
      }

      throw new Error(response?.message || "Failed to save invoice")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save invoice"
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
              <InvoiceForm
                title={formTitle}
                formError={formError}
                formData={formData}
                orderOptions={orderOptions}
                invoiceTypeOptions={invoiceTypeOptions}
                orderItems={orderItems}
                totalAmount={totalAmount}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleChange}
                onOrderSelectChange={handleOrderSelectChange}
                onInvoiceTypeSelectChange={handleInvoiceTypeSelectChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/Invoice")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between mb-3">
                  <div></div>
                  <Button color="primary" type="button" onClick={() => navigate("/Invoice/manage")}>
                    <i className="mdi mdi-plus me-1" />Add Invoice
                  </Button>
                </div>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <MDBDataTable className={data.rows && data.rows.length > 0 ? "table-auto-sr" : ""} striped bordered small noBottomColumns data={data} />
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Invoices)