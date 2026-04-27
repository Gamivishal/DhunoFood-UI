import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { DASHBOARD_NAME } from "../../config";

import { setBreadcrumbItems } from "../../store/actions"
import {
  deleteCustomerById,
  getCustomerById,
  getCustomerPages,
  saveCustomer,
} from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import CustomerForm from "./CustomerForm"

const CUSTOMER_LIST_SORT_COLUMN = "customerName"
const CUSTOMER_LIST_SORT_DIR = "asc"

const Customers = props => {
    document.title = `Customers | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const customerId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/customers/manage")
  const isEditMode = isFormPage && customerId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(CUSTOMER_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(CUSTOMER_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Customer" : "Create Customer")
  const [formData, setFormData] = useState({
    customerId: 0,
    customerName: "",
    mobileNo: "",
    address: "",
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Customers", link: "#" },
  ]

  const loadCustomers = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getCustomerPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess)) {
        throw new Error(response?.message || "Failed to load customers")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Customers")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadCustomers()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  useEffect(() => {
    const loadCustomer = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Customer")
        setFormData({
          customerId: 0,
          customerName: "",
          mobileNo: "",
          address: "",
        })
        return
      }

      setLoading(true)

      try {
        const response = await getCustomerById(customerId)
        if (!(response?.isSuccess)) {
          throw new Error(response?.message || "Failed to load customer")
        }

        const customer = response?.data || {}

        setFormTitle("Edit Customer")
        setFormData({
          customerId: customer.customerId || 0,
          customerName: customer.customerName || "",
          mobileNo: customer.mobileNo || "",
          address: customer.address || "",
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load customer")
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [isFormPage, isEditMode, customerId])

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Customer Name", field: "customerName", sort: "asc" },
          { label: "Mobile No", field: "mobileNo", sort: "asc" },
          { label: "Address", field: "address", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(customer => ({
        customerId: customer.customerId,
        customerName: customer.customerName || "",
        mobileNo: customer.mobileNo || "",
        address: customer.address || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/customers/manage/${customer.customerId}`)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === customer.customerId}
              onClick={() => handleDelete(customer.customerId)}
            >
              {deletingId === customer.customerId ? (
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

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this customer?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteCustomerById(id)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Customer deleted successfully")
        await loadCustomers()
        return
      }

      throw new Error(response?.message || "Failed to delete customer")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete customer"
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
        customerId: isEditMode ? Number(formData.customerId) || customerId : 0,
        customerName: formData.customerName,
        mobileNo: formData.mobileNo,
        address: formData.address,
      }

      const response = await saveCustomer(payload)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully")
        navigate("/customers")
        return
      }

      throw new Error(response?.message || "Failed to save customer")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save customer"
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
              <CustomerForm
                title={formTitle}
                formError={formError}
                formData={formData}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/customers")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/customers/manage")}>
                    <i className="mdi mdi-plus me-1" />Add Customer
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

export default connect(null, { setBreadcrumbItems })(Customers)