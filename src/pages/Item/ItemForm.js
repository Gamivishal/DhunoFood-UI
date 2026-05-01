import React from "react"
import Select from "react-select"
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap"

const ItemForm = ({
  title,
  formError,
  formData,
  categoryOptions,
  unitOptions,
  isEditMode,
  saving,
  onChange,
  onCategoryChange,
  onUnitChange,
  onSubmit,
  onClose,
}) => {
  const categorySelectOptions = (categoryOptions || []).map(cat => ({
    value: cat.itemCategoryId,
    label: cat.categoryName,
  }))

  const unitSelectOptions = (unitOptions || []).map(u => ({
    value: u.code,
    label: u.name,
  }))

  const selectedCategory = categorySelectOptions.find(
    option => Number(option.value) === Number(formData.categoryId)
  ) || null

  const selectedUnit = unitSelectOptions.find(
    option => option.value === formData.unit
  ) || null

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        <Button color="link" className="p-0" type="button" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Item Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="itemName"
                value={formData.itemName}
                onChange={onChange}
                placeholder="Enter item name"
              />
            </Col>
            <Col md={6}>
              <Label>Category<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select category"
                options={categorySelectOptions}
                value={selectedCategory}
                onChange={onCategoryChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Unit (UOM)<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select unit"
                options={unitSelectOptions}
                value={selectedUnit}
                onChange={onUnitChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Base Price<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={onChange}
                placeholder="Enter price"
              />
            </Col>
            <Col md={6}>
              <Label>Base Qty<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="number"
                name="baseQty"
                value={formData.baseQty}
                onChange={onChange}
                placeholder="Enter base qty"
              />
            </Col>
          </Row>

          <div className="app-form-actions">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

export default ItemForm