import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, formatDate, getNextSortState, withAutoSrColumn } from "../../common/common"
import { DASHBOARD_NAME } from "../../config";
import { setBreadcrumbItems } from "../../store/actions"
import {
  getOrderDetailsById,
  getPaymentPages,
  savePayment,
} from "../../helpers/fakebackend_helper"
import { getLovDropdownList } from "../../helpers/api_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import PaymentForm from "./PaymentForm"

const PAYMENT_LIST_SORT_COLUMN = "orderNo"
const PAYMENT_LIST_SORT_DIR = "desc"

const Payments = props => {
    document.title = `Payments | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const paymentId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/Payment/manage")
  const isEditMode = isFormPage && paymentId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(PAYMENT_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(PAYMENT_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState("Add Payment")
  const [paymentModeOptions, setPaymentModeOptions] = useState([])
  const [paymentTypeOptions, setPaymentTypeOptions] = useState([])
  const [formData, setFormData] = useState({
    paymentId: 0,
    orderId: "",
    customerId: "",
    orderNo: "",
    customerName: "",
    totalAmount: "",
    paidAmount: "",
    pendingAmount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    paymentMode: "",
    paymentType: "",
    remarks: "",
  })

  const loadPayments = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getPaymentPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess)) {
        throw new Error(response?.message || "Failed to load payments")
      }

      const list = response?.data?.data || []
      console.log("Fetched payments:", list)
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Payment")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadPayments()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  useEffect(() => {
    const loadOrderDetails = async () => {
      const orderIdFromParams = Number(new URLSearchParams(location.search).get("orderId"))
      if (!isFormPage || !orderIdFromParams) {
        return
      }

      setLoading(true)
      try {
        const response = await getOrderDetailsById(orderIdFromParams)
        if (response?.isSuccess && response?.data) {
          const data = response.data
          console.log("Fetched order details:", data)
          setFormData({
            paymentId: 0,
            orderId: data.orderId,
            customerId: data.customerId || "",
            orderNo: data.orderNo || "",
            customerName: data.customerName || "",
            totalAmount: data.totalAmount || "",
            paidAmount: data.paidAmount || "",
            pendingAmount: data.pendingAmount || "",
            paymentDate: new Date().toISOString().split("T")[0],
            amount: "",
            paymentMode: "",
            paymentType: "",
            remarks: "",
          })
          return
        }

        throw new Error(response?.message || "Failed to load order details")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    loadOrderDetails()
  }, [isFormPage, location.search])

  useEffect(() => {
    const loadPaymentModeOptions = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getLovDropdownList("PaymentMode")
        if (response?.isSuccess && Array.isArray(response?.data)) {
          setPaymentModeOptions(response.data)
          return
        }

        throw new Error(response?.message || "Failed to load payment modes")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load payment modes")
      }
    }

    loadPaymentModeOptions()
  }, [isFormPage])

  useEffect(() => {
    const loadPaymentTypeOptions = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getLovDropdownList("Paymenttype")
        if (response?.isSuccess && Array.isArray(response?.data)) {
          setPaymentTypeOptions(response.data)
          return
        }

        throw new Error(response?.message || "Failed to load payment types")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load payment types")
      }
    }

    loadPaymentTypeOptions()
  }, [isFormPage])

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Order No", field: "orderNo", sort: "asc" },
          { label: "Customer Name", field: "customerName", sort: "asc" },
          { label: "OrderDate", field: "orderDate", sort: "asc" },
          { label: "Order Amount", field: "totalAmount", sort: "asc" },

  { label: "Paid Amount", field: "paidAmount", sort: "asc" },

    { label: "Pending Amount", field: "pendingAmount", sort: "asc" },

         // { label: "Payment Mode", field: "paymentModeName", sort: "asc" },
        //  { label: "Remarks", field: "remarks", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(payment => ({
        paymentId: payment.paymentId,
        orderId: payment.orderId || "-",
        customerName: payment.customerName || "",
        orderNo: payment.orderNo || "-",
        orderDate: formatDate(payment.orderDate),
        totalAmount: payment.totalAmount ?? 0,

        paidAmount: payment.paidAmount ?? 0,
        pendingAmount: payment.pendingAmount ?? 0,

        paymentModeName: payment.paymentModeName || "-",
        remarks: payment.remarks || "-",
        action: (
          <Button color="success" size="sm" onClick={() => navigate(`/Payment/manage?orderId=${payment.orderId}`)}>
            Add Payment
          </Button>
        ),
      })),
    })
  }, [rows, sortColumn, sortColumnDir])

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError("")

    setSaving(true)

    try {
      const paymentDateValue = formData.paymentDate 
        ? new Date(formData.paymentDate).toISOString() 
        : null

      const payload = {
        paymentId: 0,
        orderId: Number(formData.orderId) || 0,
        customerId: Number(formData.customerId) || 0,
        paymentDate: paymentDateValue,
        amount: Number(formData.amount) || 0,
        paymentMode: formData.paymentMode || "",
        paymentType: formData.paymentType || "",
        pendingAmount: Number(formData.pendingAmount) || 0,
        remarks: formData.remarks || "",
      }

      const response = await savePayment(payload)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Payment saved successfully")
navigate("/Payment")
        return
      }

      throw new Error(response?.message || "Failed to save payment")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save payment"
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
              <PaymentForm
                title={formTitle}
                formError={formError}
                formData={formData}
                paymentModeOptions={paymentModeOptions}
                paymentTypeOptions={paymentTypeOptions}
                saving={saving}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/Payment")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                     <div className="table-responsive">
                  <MDBDataTable 
                  //className={data.rows && data.rows.length > 0 ? "table-auto-sr" : ""}
                   striped bordered small noBottomColumns data={data} />
             </div>
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Payments)