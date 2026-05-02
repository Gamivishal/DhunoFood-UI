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

const QuotationForm = ({
  title,
  formError,
  formData,
  itemOptions,
  customerOptions,
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
  onAddCustomer,
}) => {
  const itemSelectOptions = (itemOptions || []).map(item => ({
    value: item.itemId || item.id,
    label: item.itemName || item.name,
    price: item.price,
    baseQty: item.baseQty,
    ratePerUnit: item.ratePerUnit,
    unit: item.unit,
  }))

  const customerSelectOptions = (customerOptions || []).map(customer => ({
    value: customer.id,
    label: customer.name,
  }))

  const handleCustomerSelectChange = option => {
    onChange({
      target: {
        name: "customerId",
        value: option?.value || 0,
      },
    })
  }

  const handleItemSelectChange = (index, option) => {
    const selectedItem = itemSelectOptions.find(opt => Number(opt.value) === Number(option?.value))
    const currentItem = formData.items[index] || {}
    const baseQty = selectedItem?.baseQty || 0
    const ratePerUnit = selectedItem?.ratePerUnit || 0
    const unit = selectedItem?.unit || ""
    onItemChange(index, {
      target: {
        name: "itemSelected",
        value: JSON.stringify({
          itemId: option?.value || 0,
          itemName: option?.label || "",
          price: selectedItem?.price || 0,
          baseQty: baseQty,
          ratePerUnit: ratePerUnit,
          amount: ratePerUnit * baseQty,
          unit: unit,
        })
      }
    })
  }

  const handleQuantityChange = (index, e) => {
    let qty = Number(e.target.value) || 0
    if (qty < 1) qty = 1
    const updatedItems = [...formData.items]
    const currentItem = formData.items[index] || {}
    const ratePerUnit = currentItem.ratePerUnit || 0
    updatedItems[index] = {
      ...currentItem,
      baseQty: qty,
      amount: ratePerUnit * qty,
    }
    onItemChange(index, {
      target: {
        name: "baseQty",
        value: qty
      }
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
              <Label>Customer<span style={{ color: "red" }}>*</span></Label>
              <div className="d-flex align-items-center gap-2">
                <div className="flex-grow-1">
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
                </div>
                <Button
                  color="primary"
                  size="sm"
                  type="button"
                  title="Add Customer"
                  onClick={onAddCustomer}
                >
                  <i className="mdi mdi-plus" />
                </Button>
              </div>
            </Col>
            <Col md={6}>
              <Label>Quotation Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="date"
                name="quotationDate"
                value={formData.quotationDate}
                onChange={onChange}
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
                      <th style={{ width: "180px" }}>Item</th>
                      <th style={{ width: "130px" }}>Price (Qty-UOM)</th>
                      <th style={{ width: "100px" }}>Quantity</th>
                      <th className="d-none" style={{ width: "100px" }}>Rate/Unit</th>
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
                        {/* <td>
                          <Input
                            type="number"
                            name="price"
                            value={item.price || 0}
                            readOnly
                          />
                        </td> */}
                         <td>
                                                  <Input
                                                    type="text"
                                                    name="price"
                                                    // value={`${item.baseQty} ${item.unit}---${item.price || 0}`}
                                                     value={item.baseQty && item.unit ? `${item.price || 0} (${item.baseQty} ${item.unit})` : item.price || 0}
                                                    readOnly
                                                  />
                                                </td>
                        <td>
                          <Input
                            type="number"
                            name="baseQty"
                            value={item.baseQty || 0}
                            onChange={e => handleQuantityChange(index, e)}
                            min={1}
                          />
                        </td>
                        <td className="d-none">
                          <Input
                            type="number"
                            name="ratePerUnit"
                            value={item.ratePerUnit || 0}
                            readOnly
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

export default QuotationForm