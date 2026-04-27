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

const ExpenseForm = ({
  title,
  formError,
  formData,
  categoryOptions,
  paymentModeOptions,
  isEditMode,
  saving,
  onChange,
  onCategoryChange,
  onPaymentModeChange,
  onSubmit,
  onClose,
}) => {
  const categorySelectOptions = (categoryOptions || []).map(cat => ({
    value: cat.expenseCategoryId,
    label: cat.categoryName,
  }))

  const paymentModeSelectOptions = (paymentModeOptions || []).map(pm => ({
    value: pm.code,
    label: pm.name,
  }))

  const selectedCategory = categorySelectOptions.find(
    option => Number(option.value) === Number(formData.categoryId)
  ) || null

  const selectedPaymentMode = paymentModeSelectOptions.find(
    option => option.value === formData.paymentMode
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
              <Label>Expense Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="datetime-local"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={onChange}
                placeholder="Select expense date"
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
              <Label>Amount<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={onChange}
                placeholder="Enter amount"
              />
            </Col>
            <Col md={6}>
              <Label>Payment Mode<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select payment mode"
                options={paymentModeSelectOptions}
                value={selectedPaymentMode}
                onChange={onPaymentModeChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={12}>
              <Label>Description</Label>
              <Input
                type="textarea"
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Enter description"
                rows={3}
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

export default ExpenseForm