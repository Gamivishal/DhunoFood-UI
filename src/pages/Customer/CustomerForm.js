import React from "react"
import { Button, Card, CardBody, Col, Form, FormGroup, Input, Label, Row } from "reactstrap"
import { Spinner } from "reactstrap"

const CustomerForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <Card>
      <CardBody>
        <h4 className="card-title mb-4">{title}</h4>

        {formError ? (
          <div className="alert alert-danger">{formError}</div>
        ) : null}

        <Form onSubmit={onSubmit}>
          <Row>
            <Col md={6}>
              <FormGroup className="mb-3">
                <Label for="customerName">
                  Customer Name <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  name="customerName"
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={onChange}
                  required
                />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup className="mb-3">
                <Label for="mobileNo">
                  Mobile No <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  name="mobileNo"
                  id="mobileNo"
                  placeholder="Enter mobile number"
                  value={formData.mobileNo}
                  onChange={onChange}
                  required
                />
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <FormGroup className="mb-3">
                <Label for="address">Address</Label>
                <Input
                  type="textarea"
                  name="address"
                  id="address"
                  rows="3"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={onChange}
                />
              </FormGroup>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button type="button" color="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Saving...
                </>
              ) : (
                isEditMode ? "Update" : "Save"
              )}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

export default CustomerForm