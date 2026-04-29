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

const PaymentForm = ({
  title,
  formError,
  formData,
  orderOptions,
  paymentModeOptions,
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {
  const orderSelectOptions = (orderOptions || []).map(order => ({
    value: order.id,
    label: order.name,
  }))

  const paymentModeSelectOptions = (paymentModeOptions || []).map(mode => ({
    value: mode.code,
    label: mode.name,
  }))

  const handleOrderSelectChange = option => {
    onChange({
      target: {
        name: "orderId",
        value: option?.value || "",
      },
    })
  }

  const handlePaymentModeSelectChange = option => {
    onChange({
      target: {
        name: "paymentMode",
        value: option?.value || "",
      },
    })
  }

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
              <Label>Order<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select order"
                options={orderSelectOptions}
                value={orderSelectOptions.find(
                  opt => Number(opt.value) === Number(formData.orderId)
                ) || null}
                onChange={handleOrderSelectChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Payment Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={onChange}
              />
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col md={6}>
              <Label>Amount<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="number"
                name="amount"
                value={formData.amount || ""}
                onChange={onChange}
                placeholder="Enter amount"
                min={0}
              />
            </Col>
            <Col md={6}>
              <Label>Payment Mode<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select payment mode"
                options={paymentModeSelectOptions}
                value={paymentModeSelectOptions.find(
                  opt => opt.value === formData.paymentMode
                ) || null}
                onChange={handlePaymentModeSelectChange}
                isSearchable
                isClearable
              />
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col md={12}>
              <Label>Remarks</Label>
              <Input
                type="textarea"
                name="remarks"
                value={formData.remarks || ""}
                onChange={onChange}
                placeholder="Enter remarks"
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

export default PaymentForm