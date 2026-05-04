import React, { useEffect, useMemo, useState } from "react"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { DASHBOARD_NAME } from "../../config";

import { setBreadcrumbItems } from "../../store/actions"
import {
  deleteItemById,
  getItemById,
  getItemCategoryPages,
  getItemPages,
  getItemUnits,
  saveItem,
} from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import ItemForm from "./ItemForm"

const ITEM_LIST_SORT_COLUMN = "price"
const ITEM_LIST_SORT_DIR = "asc"

const Items = props => {
    document.title = `Items | ${DASHBOARD_NAME}`
  //document.title = "Items | Lexa - Responsive Bootstrap 5 Admin Dashboard"
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const itemId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/Item/manage")
  const isEditMode = isFormPage && itemId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [categoryOptions, setCategoryOptions] = useState([])
  const [unitOptions, setUnitOptions] = useState([])
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(ITEM_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(ITEM_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Item" : "Create Item")
  const [formData, setFormData] = useState({
    id: 0,
    itemName: "",
    categoryId: "",
    unit: "",
    price: "",
    baseQty: 0,
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Items", link: "#" },
  ]

  const loadItems = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getItemPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess)) {
        throw new Error(response?.message || "Failed to load items")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load items")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Items")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadItems()
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
        const response = await getItemCategoryPages({
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
    const loadUnits = async () => {
      if (!isFormPage) {
        return
      }

      try {
        const response = await getItemUnits()
        if (response?.isSuccess && Array.isArray(response?.data)) {
          setUnitOptions(response.data)
          return
        }

        throw new Error(response?.message || "Failed to load units")
      } catch (err) {
        setFormError(err?.message || err || "Failed to load units")
      }
    }

    loadUnits()
  }, [isFormPage])

  useEffect(() => {
    const loadItem = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      if (!isEditMode) {
        setFormTitle("Create Item")
        setFormData({
          id: 0,
          itemName: "",
          categoryId: "",
          unit: "",
          price: "",
          baseQty: 0,
        })
        return
      }

      setLoading(true)

      try {
        const response = await getItemById(itemId)
        if (!(response?.isSuccess)) {
          throw new Error(response?.message || "Failed to load item")
        }

        const item = response?.data || {}

        setFormTitle("Edit Item")
        setFormData({
          id: item.itemId || 0,
          itemName: item.itemName || "",
          categoryId: item.categoryId ?? "",
          unit: item.unit ?? "",
          price: item.price ?? "",
          baseQty: item.baseQty ?? 0,
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load item")
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [isFormPage, isEditMode, itemId])

  const data = useMemo(() => {
    return withAutoSrColumn({
columns: buildServerSortColumns({
        columns: [
          { label: "Item Name", field: "itemName", sort: "asc" },
          { label: "Category", field: "categoryName", sort: "asc" },
          { label: "Unit", field: "unitName", sort: "asc" },
          { label: "Price", field: "price", sort: "asc" },
    //      { label: "Payment Mode", field: "paymentName", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName || "",
        categoryName: item.categoryName || "",
        unitName: item.unitName || "",
        price: item.price ?? "",
    //    paymentName: item.paymentName || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/Item/manage/${item.itemId}`)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.itemId}
              onClick={() => handleDelete(item.itemId)}
            >
              {deletingId === item.itemId ? (
                <Spinner size="sm" />
              ) : (
                <i className="mdi mdi-trash-can-outline font-size-18" />
              )}
            </Button>
          </div>
        ),
      })),
    })
  }, [rows, sortColumn, sortColumnDir, unitOptions])

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

  const handleUnitChange = option => {
    setFormData(previous => ({
      ...previous,
      unit: option?.value ?? "",
    }))
  }

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this item?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteItemById(id)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Item deleted successfully")
        await loadItems()
        return
      }

      throw new Error(response?.message || "Failed to delete item")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete item"
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
        itemId: isEditMode ? Number(formData.id) || itemId : 0,
        itemName: formData.itemName,
        categoryId: Number(formData.categoryId) || 0,
        unit: formData.unit,
        price: Number(formData.price) || null,
        baseQty: Number(formData.baseQty) || null,
      }

      const response = await saveItem(payload)
      if (response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully")
        navigate("/Item")
        return
      }

      throw new Error(response?.message || "Failed to save item")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save item"
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
              <ItemForm
                title={formTitle}
                formError={formError}
                formData={formData}
                categoryOptions={categoryOptions}
                unitOptions={unitOptions}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleChange}
                onCategoryChange={handleCategoryChange}
                onUnitChange={handleUnitChange}
                onSubmit={handleSubmit}
                onClose={() => navigate("/Item")}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/Item/manage")}>
                    <i className="mdi mdi-plus me-1" />Add Item
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

export default connect(null, { setBreadcrumbItems })(Items)