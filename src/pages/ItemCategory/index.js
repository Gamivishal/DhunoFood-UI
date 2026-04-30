import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { DASHBOARD_NAME } from "../../config";

import { setBreadcrumbItems } from "../../store/actions"
import {
  deleteItemCategoryById,
  getItemCategoryById,
  getItemCategoryPages,
  saveItemCategory,
} from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import ItemCategoryForm from "./ItemCategoryForm"

const ITEM_CATEGORY_LIST_SORT_COLUMN = "categoryName"
const ITEM_CATEGORY_LIST_SORT_DIR = "asc"

const ItemCategories = props => {
    document.title = `Item Categories | ${DASHBOARD_NAME}`
 // document.title = "Item Categories | Lexa - Responsive Bootstrap 5 Admin Dashboard"
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const itemCategoryId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/ItemCategory/manage")
  const isEditMode = isFormPage && itemCategoryId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(ITEM_CATEGORY_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(ITEM_CATEGORY_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Category" : "Create Category")
  const [formData, setFormData] = useState({
    id: 0,
    categoryName: "",
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Item Categories", link: "#" },
  ]

  const loadItemCategories = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getItemCategoryPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess)) {
        throw new Error(response?.message || "Failed to load categories")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Item Categories")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadItemCategories()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  useEffect(() => {
    const loadItemCategory = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Category")
        setFormData({
          id: 0,
          categoryName: "",
        })
        return
      }

      setLoading(true)

      try {
        const response = await getItemCategoryById(itemCategoryId)
        if (!(response?.isSuccess)) {
          throw new Error(response?.message || "Failed to load category")
        }

        const category = response?.data || {}

        setFormTitle("Edit Category")
        setFormData({
          id: category.itemCategoryId || 0,
          categoryName: category.categoryName || "",
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load category")
      } finally {
        setLoading(false)
      }
    }

    loadItemCategory()
  }, [isFormPage, isEditMode, itemCategoryId])

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Category Name", field: "categoryName", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        itemCategoryId: item.itemCategoryId,
        categoryName: item.categoryName || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/ItemCategory/manage/${item.itemCategoryId}`)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.itemCategoryId}
              onClick={() => handleDelete(item.itemCategoryId)}
            >
              {deletingId === item.itemCategoryId ? (
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

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this category?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteItemCategoryById(id)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Category deleted successfully")
        await loadItemCategories()
        return
      }

      throw new Error(response?.message || "Failed to delete category")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete category"
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
        itemCategoryId: isEditMode ? Number(formData.id) || itemCategoryId : 0,
        categoryName: formData.categoryName,
      }

      const response = await saveItemCategory(payload)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully")
        navigate("/ItemCategory")
        return
      }

      throw new Error(response?.message || "Failed to save category")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save category"
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
              <ItemCategoryForm
                title={formTitle}
                formError={formError}
                formData={formData}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/ItemCategory")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/ItemCategory/manage")}>
                    <i className="mdi mdi-plus me-1" />Add Category
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

export default connect(null, { setBreadcrumbItems })(ItemCategories)