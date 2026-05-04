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
  paymentModeOptions,
  paymentTypeOptions,
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {

const paymentModeSelectOptions = (paymentModeOptions || []).map(mode => ({
    value: mode.code,
    label: mode.name,
  }))

  const paymentTypeSelectOptions = (paymentTypeOptions || []).map(type => ({
    value: type.code,
    label: type.name,
  }))

  const handlePaymentModeSelectChange = option => {
    onChange({
      target: {
        name: "paymentMode",
        value: option?.value || "",
      },
    })
  }

  const handlePaymentTypeSelectChange = option => {
    onChange({
      target: {
        name: "paymentType",
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
          {/* <Row className="g-3">
            <Col md={6}>
              <Label>Payment Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={onChange}
              />
            </Col>
          </Row> */}

          {formData.orderNo ? (
            <Row className="g-3 mt-2">
              <Col md={6}>
                <Label>Order No</Label>
                <Input value={formData.orderNo} disabled />
              </Col>
              <Col md={6}>
                <Label>Customer Name</Label>
                <Input value={formData.customerName} disabled />
              </Col>
            </Row>
          ) : null}

          {formData.orderNo ? (
            <Row className="g-3 mt-2">
              <Col md={6}>
                <Label>Order Amount</Label>
                <Input value={formData.totalAmount} disabled />
              </Col>
              <Col md={6}>
                <Label>Paid Amount</Label>
                <Input value={formData.paidAmount} disabled />
              </Col>
              {/* <Col md={4}>
                <Label>Pending Amount</Label>
                <Input value={formData.pendingAmount} disabled />
              </Col> */}
            </Row>
          ) : null}

          <Row className="g-3 mt-2">
             <Col md={6}>
                <Label>Pending Amount</Label>
                <Input value={formData.pendingAmount} disabled />
              </Col>
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
              <Label>Payment Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={onChange}
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
            <Col md={6}>
              <Label>Payment Type<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select payment type"
                options={paymentTypeSelectOptions}
                value={paymentTypeSelectOptions.find(
                  opt => opt.value === formData.paymentType
                ) || null}
                onChange={handlePaymentTypeSelectChange}
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
           
            <Button color="success" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>

             <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

export default PaymentForm