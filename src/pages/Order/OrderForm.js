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
  Table,
} from "reactstrap"

const OrderForm = ({
  title,
  formError,
  formData,
  itemOptions,
  customerOptions,
  statusOptions,
  isEditMode,
  saving,
  onChange,
  onItemChange,
  onQuantityChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  onClose,
  calculateTotal,
}) => {
  const itemSelectOptions = (itemOptions || []).map(item => ({
    value: item.id,
    label: item.name,
    price: item.price,
  }))

  const customerSelectOptions = (customerOptions || []).map(customer => ({
    value: customer.id,
    label: customer.name,
  }))

  const statusSelectOptions = (statusOptions || []).map(status => ({
    value: status.code,
    label: status.name,
  }))

  const handleCustomerSelectChange = option => {
    onChange({
      target: {
        name: "customerId",
        value: option?.value || 0,
      },
    })
  }

  const handleStatusSelectChange = option => {
    onChange({
      target: {
        name: "status",
        value: option?.value || "",
      },
    })
  }

  const handleItemSelectChange = (index, option) => {
    const selectedItem = itemSelectOptions.find(opt => Number(opt.value) === Number(option?.value))
    const itemPrice = selectedItem?.price || 0
    const currentItem = formData.items[index] || {}
    const qty = currentItem.quantity || 1
    
    onItemChange(index, { 
      target: { 
        name: "itemSelected", 
        value: JSON.stringify({
          itemId: option?.value || 0,
          itemName: option?.label || "",
          price: itemPrice,
          quantity: qty,
          amount: itemPrice * qty,
        })
      } 
    })
  }

  const handleQuantityChange = (index, e) => {
    let qty = Number(e.target.value) || 0
    if (qty < 1) qty = 1
    const updatedItems = [...formData.items]
    const currentItem = formData.items[index] || {}
    const currentQty = currentItem.quantity || 1
    const itemPrice = currentItem.price || 0
    updatedItems[index] = {
      ...currentItem,
      quantity: qty,
      amount: qty * itemPrice,
    }
    onQuantityChange(index, qty)
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
              <Label>Customer<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select customer"
                options={customerSelectOptions}
                value={customerSelectOptions.find(
                  opt => Number(opt.value) === Number(formData.customerId)
                ) || null}
                onChange={handleCustomerSelectChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Order Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="date"
                name="orderDate"
                value={formData.orderDate}
                onChange={onChange}
              />
            </Col>
            <Col md={6}>
              <Label>Status</Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select status"
                options={statusSelectOptions}
                value={statusSelectOptions.find(
                  opt => opt.value === formData.status
                ) || null}
                onChange={handleStatusSelectChange}
                isSearchable
                isClearable
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
                      <th style={{ width: "200px" }}>Item</th>
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
                          <Select
                            classNamePrefix="select2-selection"
                            placeholder="Select item"
                            options={itemSelectOptions}
                            value={itemSelectOptions.find(
                              opt => Number(opt.value) === Number(item.itemId)
                            ) || null}
                            onChange={option => handleItemSelectChange(index, option)}
                            isSearchable
                            isClearable
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name="price"
                            value={item.price || 0}
                            readOnly
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name="quantity"
                            value={item.quantity || 1}
                            onChange={e => handleQuantityChange(index, e)}
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

export default OrderForm