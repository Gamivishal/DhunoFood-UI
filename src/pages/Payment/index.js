import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, formatDate, getNextSortState, withAutoSrColumn } from "../../common/common"
import { DASHBOARD_NAME } from "../../config";
import { setBreadcrumbItems } from "../../store/actions"
import {
  getOrderDropdownList,
  getPaymentPages,
  savePayment,
} from "../../helpers/fakebackend_helper"
import { getLovDropdownList } from "../../helpers/api_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import PaymentForm from "./PaymentForm"

const PAYMENT_LIST_SORT_COLUMN = "paymentDate"
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
  const [orderOptions, setOrderOptions] = useState([])
  const [paymentModeOptions, setPaymentModeOptions] = useState([])
  const [formData, setFormData] = useState({
    paymentId: 0,
    orderId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    paymentMode: "",
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
    props.setBreadcrumbItems("Payments")
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
    const loadOrderOptions = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getOrderDropdownList()
        if (response?.isSuccess && Array.isArray(response?.data)) {
          setOrderOptions(response.data)
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

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Order No", field: "orderNo", sort: "asc" },
          { label: "Customer Name", field: "customerName", sort: "asc" },
          { label: "Payment Date", field: "paymentDate", sort: "asc" },
          { label: "Amount", field: "amount", sort: "asc" },
          { label: "Payment Mode", field: "paymentModeName", sort: "asc" },
          { label: "Remarks", field: "remarks", sort: "asc" },
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
        paymentDate: formatDate(payment.paymentDate),
        amount: payment.amount ?? 0,
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
      const payload = {
        paymentId: 0,
        orderId: Number(formData.orderId) || 0,
        paymentDate: new Date(formData.paymentDate).toISOString(),
        amount: Number(formData.amount) || 0,
        paymentMode: formData.paymentMode || "",
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
                orderOptions={orderOptions}
                paymentModeOptions={paymentModeOptions}
                saving={saving}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/Payment")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/Payment/manage")}>
                    <i className="mdi mdi-plus me-1" />Add Payment
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

export default connect(null, { setBreadcrumbItems })(Payments)