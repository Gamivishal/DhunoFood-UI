import React from "react";
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap";
import Select from "react-select";

const AdvancePaymentForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onSubmit,
  onClose,
  customerList = [],
  onCustomerChange,
  statusList = [],
  onStatusChange,
  paymentModeList = [],
  onPaymentModeChange,
}) => {

  const customerSelectOptions = (customerList || []).map(customer => ({
    value: customer.id,
    label: customer.name,
  }));
  const selectedCustomer = customerSelectOptions.find(option => Number(option.value) === Number(formData.customerId)) || null;

  const statusSelectOptions = (statusList || []).map(status => ({
    value: status.code || status.value || status.id,
    label: status.name || status.label,
  }));
  const selectedStatus = statusSelectOptions.find(option => String(option.value) === String(formData.status)) || null;

  const paymentModeOptions = (paymentModeList || []).map(mode => ({
    value: mode.code || mode.value || mode.id,
    label: mode.name || mode.label,
  }));
  const selectedPaymentMode = paymentModeOptions.find(option => String(option.value) === String(formData.paymentMode)) || null;

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        {/* <Button color="link" className="p-0" type="button" onClick={onClose}>
          Close
        </Button> */}
            <Button color="secondary" type="button" onClick={onClose}>
                            <i className="mdi mdi-arrow-left me-1" />Back
                          </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Select Customer<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select customer"
                options={customerSelectOptions}
                value={selectedCustomer}
                onChange={onCustomerChange}
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Paid Amount<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="totalAmount"
                type="number"
                value={formData.totalAmount}
                onChange={onChange}
                placeholder="Enter total amount"
              />
            </Col>
            <Col md={6}>
              <Label>Payment Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="paymentDate"
                type="date"
                value={formData.paymentDate ? formData.paymentDate.substring(0, 10) : ""}
                onChange={onChange}
                placeholder="YYYY-MM-DD"
                max={new Date().toISOString().split("T")[0]}
              />
            </Col>
            <Col md={6}>
              <Label>Payment Mode<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select payment mode"
                options={paymentModeOptions}
                value={selectedPaymentMode}
                onChange={onPaymentModeChange}
                isClearable
              />
            </Col>
              {isEditMode && (
              <>
                {/* <Col md={6}>
                  <Label>Remaining Amount<span style={{ color: "red" }}>*</span></Label>
                  <Input
                    name="remainingAmount"
                    type="number"
                    value={formData.remainingAmount}
                    onChange={onChange}
                    placeholder="Enter remaining amount"
                  />
                </Col> */}
                <Col md={6}>
                  <Label>Status<span style={{ color: "red" }}>*</span></Label>
                  <Select
                    classNamePrefix="select2-selection"
                    placeholder="Select status"
                    options={statusSelectOptions}
                    value={selectedStatus}
                    onChange={onStatusChange}
                    isClearable
                  />
                </Col>
              </>
            )}
            <Col md={12}>
              <Label>Remark</Label>
              <Input
                name="remark"
                value={formData.remark || ""}
                onChange={onChange}
                placeholder="Enter remark"
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
  );
};

export default AdvancePaymentForm;
