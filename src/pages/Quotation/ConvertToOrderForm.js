import React from "react"
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
  Table,
} from "reactstrap"

const ConvertToOrderForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  onClose,
  calculateTotal,
}) => {
  const handleOrderDateChange = e => {
    let value = e.target.value
    if (value) {
      const date = new Date(value)
      value = date.toISOString()
    }
    onChange({
      target: {
        name: "orderDate",
        value: value,
      },
    })
  }

  const getOrderDateValue = () => {
    if (formData.orderDate) {
      const date = new Date(formData.orderDate)
      return date.toISOString().slice(0, 16)
    }
    return ""
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
              <Label>Customer</Label>
              <Input type="text" value={formData.customerName || ""} readOnly />
            </Col>
            <Col md={6}>
              <Label>Order Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="datetime-local"
                name="orderDate"
                value={getOrderDateValue()}
                onChange={handleOrderDateChange}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={12}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Label className="mb-0">Items</Label>
                <Button color="primary" size="sm" type="button" onClick={onAddItem}>
                  <i className="mdi mdi-plus me-1" />Add Item
                </Button>
              </div>
              <div className="table-responsive">
                <Table className="table-sm table-bordered" striped>
                  <thead>
                    <tr>
                      <th style={{ width: "250px" }}>Item Name</th>
                      <th style={{ width: "120px" }}>Price</th>
                      <th style={{ width: "120px" }}>Quantity</th>
                      <th style={{ width: "120px" }}>Amount</th>
                      <th style={{ width: "60px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(formData.items || []).map((item, index) => (
                      <tr key={index}>
                        <td>
                          <Input
                            type="text"
                            name="itemName"
                            value={item.itemName || ""}
                            onChange={e => onItemChange(index, e)}
                            placeholder="Enter item name"
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name="price"
                            value={item.price || 0}
                            onChange={e => onItemChange(index, e)}
                            min={0}
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name="quantity"
                            value={item.quantity || 1}
                            onChange={e => onItemChange(index, e)}
                            min={1}
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name="amount"
                            value={item.amount || 0}
                            readOnly
                          />
                        </td>
                        <td>
                          <Button
                            color="link"
                            className="p-0 text-danger"
                            type="button"
                            onClick={() => onRemoveItem(index)}
                            disabled={formData.items.length <= 1}
                          >
                            <i className="mdi mdi-trash-can-outline font-size-18" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col md={{ size: 4, offset: 8 }}>
              <div className="text-end">
                <strong>Total Amount: </strong>
                <span className="ms-2">{calculateTotal()}</span>
              </div>
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

export default ConvertToOrderForm