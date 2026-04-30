import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { DASHBOARD_NAME } from "../../config";
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import {
  deleteExpenseById,
  getExpenseById,
  getExpenseCategoryPages,
  getExpensePages,
  getExpensePaymentModes,
  saveExpense,
} from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import ExpenseForm from "./ExpenseForm"

const EXPENSE_LIST_SORT_COLUMN = "expenseDate"
const EXPENSE_LIST_SORT_DIR = "asc"

const Expenses = props => {
    document.title = `Expenses | ${DASHBOARD_NAME}`
  //document.title = "Expenses | Lexa - Responsive Bootstrap 5 Admin Dashboard"
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const expenseId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/Expense/manage")
  const isEditMode = isFormPage && expenseId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [categoryOptions, setCategoryOptions] = useState([])
  const [paymentModeOptions, setPaymentModeOptions] = useState([])
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(EXPENSE_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(EXPENSE_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Expense" : "Create Expense")
  const [formData, setFormData] = useState({
    id: 0,
    expenseDate: "",
    categoryId: "",
    amount: "",
    paymentMode: "",
    description: "",
    isActive: true,
    isDeleted: false,
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Expenses", link: "#" },
  ]

  const loadExpenses = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getExpensePages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

if (!(response?.isSuccess)) {
        throw new Error(response?.message || "Failed to load expenses")
      }

      const list = response?.data?.data || []
      console.log("Fetched expenses:", list)
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load expenses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Expenses")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadExpenses()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  useEffect(() => {
    const loadCategories = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getExpenseCategoryPages({
          start: 0,
          length: 100,
        })
        if (response?.isSuccess && Array.isArray(response?.data?.data)) {
          setCategoryOptions(response.data.data)
          return
        }

        throw new Error(response?.message || "Failed to load categories")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load categories")
      }
    }

    loadCategories()
  }, [isFormPage])

  useEffect(() => {
    const loadPaymentModes = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getExpensePaymentModes()
        if (response?.isSuccess && Array.isArray(response?.data)) {
          setPaymentModeOptions(response.data)
          return
        }

        throw new Error(response?.message || "Failed to load payment modes")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load payment modes")
      }
    }

    loadPaymentModes()
  }, [isFormPage])

  useEffect(() => {
    const loadExpense = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Expense")
        setFormData({
          id: 0,
          expenseDate: "",
          categoryId: "",
          amount: "",
          paymentMode: "",
          description: "",
          isActive: true,
          isDeleted: false,
        })
        return
      }

      setLoading(true)

      try {
        const response = await getExpenseById(expenseId)
        if (!(response?.isSuccess)) {
          throw new Error(response?.message || "Failed to load expense")
        }

        const expense = response?.data || {}
        const expenseDate = expense.expenseDate
          ? new Date(expense.expenseDate).toISOString().slice(0, 10)
          : ""

        setFormTitle("Edit Expense")
        setFormData({
          id: expense.expenseId || 0,
          expenseDate,
          categoryId: expense.categoryId ?? "",
          amount: expense.amount ?? "",
          paymentMode: expense.paymentMode ?? "",
          description: expense.description || "",
          isActive: expense.isActive ?? true,
          isDeleted: Boolean(expense.isDeleted),
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load expense")
      } finally {
        setLoading(false)
      }
    }

    loadExpense()
  }, [isFormPage, isEditMode, expenseId])

  const formatDate = dateString => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  // const formatPaymentMode = mode => {
  //   const modeMap = {
  //     1: "Cash",
  //     2: "Card",
  //     3: "UPI",
  //     4: "Bank Transfer",
  //   }
  //   return modeMap[mode] || mode
  // }

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Expense Date", field: "expenseDate", sort: "asc" },
          { label: "Amount", field: "amount", sort: "asc" },
          { label: "Payment Mode", field: "paymentName", sort: "asc" },
          { label: "Description", field: "description", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        expenseId: item.expenseId,
        expenseDate: formatDate(item.expenseDate),
        categoryName: item.categoryName || "",
        amount: item.amount ?? "",
        paymentName: item.paymentName || "",
        description: item.description || "",
        isActive: item.isActive ? "Yes" : "No",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/Expense/manage/${item.expenseId}`)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.expenseId}
              onClick={() => handleDelete(item.expenseId)}
            >
              {deletingId === item.expenseId ? (
                <Spinner size="sm" />
              ) : (
                <i className="mdi mdi-trash-can-outline font-size-18" />
              )}
            </Button>
          </div>
        ),
      })),
    })
  }, [rows, sortColumn, sortColumnDir])

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setFormData(previous => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCategoryChange = option => {
    setFormData(previous => ({
      ...previous,
      categoryId: option?.value ?? "",
    }))
  }

  const handlePaymentModeChange = option => {
    setFormData(previous => ({
      ...previous,
      paymentMode: option?.value ?? "",
    }))
  }

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this expense?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteExpenseById(id)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Expense deleted successfully")
        await loadExpenses()
        return
      }

      throw new Error(response?.message || "Failed to delete expense")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete expense"
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
        expenseId: isEditMode ? Number(formData.id) || expenseId : 0,
        expenseDate: formData.expenseDate ? formData.expenseDate.slice(0, 10) : null,
        categoryId: Number(formData.categoryId) || 0,
        amount: formData.amount ? Number(formData.amount) : null,
        paymentMode: formData.paymentMode,
        description: formData.description,
        isActive: Boolean(formData.isActive),
        isDeleted: Boolean(formData.isDeleted),
      }

      const response = await saveExpense(payload)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully")
        navigate("/Expense")
        return
      }

      throw new Error(response?.message || "Failed to save expense")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save expense"
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
              <ExpenseForm
                title={formTitle}
                formError={formError}
                formData={formData}
                categoryOptions={categoryOptions}
                paymentModeOptions={paymentModeOptions}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleChange}
                onCategoryChange={handleCategoryChange}
                onPaymentModeChange={handlePaymentModeChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/Expense")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/Expense/manage")}>
                    <i className="mdi mdi-plus me-1" />Add Expense
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

export default connect(null, { setBreadcrumbItems })(Expenses)