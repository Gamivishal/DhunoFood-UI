import React from "react"
import Select from "react-select"
import { FaTimes } from "react-icons/fa";
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
  itemOptions,
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
  const itemSelectOptions = (itemOptions || []).map(item => ({
    value: item.itemId || item.id,
    label: item.itemName || item.name,
    price: item.price,
    quantity: item.baseQty,
    ratePerUnit: item.ratePerUnit,
    unit: item.unit,
      priceUMO: item.priceUMO,
  }))

  const handleItemSelectChange = (index, option) => {
    const selectedItem = itemSelectOptions.find(opt => Number(opt.value) === Number(option?.value))
    const currentItem = formData.items[index] || {}
    const quantity = selectedItem?.quantity || 0
    const ratePerUnit = selectedItem?.ratePerUnit || 0
    const unit = selectedItem?.unit || ""
    const priceUMO = selectedItem?.priceUMO || ""
    onItemChange(index, {
      target: {
        name: "itemSelected",
        value: JSON.stringify({
          itemId: option?.value || 0,
          itemName: option?.label || "",
          price: selectedItem?.price || 0,
          quantity: quantity,
          ratePerUnit: ratePerUnit,
          amount: ratePerUnit * quantity,
          unit: unit,
            priceUMO: priceUMO,
        })
      }
    })
  }
  const handleOrderDateChange = e => {
    onChange({
      target: {
        name: "orderDate",
        value: e.target.value,
      },
    })
  }

  const getOrderDateValue = () => {
    return formData.orderDate || ""
  }

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        {/* <Button color="link" className="p-0" type="button" onClick={onClose}>
          Close
        </Button> */}
         <Button color="link" className="p-0" type="button" onClick={onClose}>
                  <FaTimes color="red" size={18} />
                </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Customer<span style={{ color: "red" }}>*</span></Label>
              <Input type="text" value={formData.customerName || ""} readOnly />
            </Col>
            <Col md={6}>
              <Label>Order Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="date"
                name="orderDate"
                value={getOrderDateValue()}
                onChange={handleOrderDateChange}
              />
            </Col>
            <Col md={6}>
              <Label>Order Time<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="time"
                name="orderTime"
                value={formData.orderTime || ""}
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
                      <th style={{ width: "180px" }}>Item Name</th>
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
                        <td>
                          <Input
                            type="text"
                            name="price"
                              value={item.priceUMO || 0}
                          //  value={item.baseQty && item.unit ? `${item.price || 0} (${item.baseQty} ${item.unit})` : item.price || 0}
                            readOnly
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            name="quantity"
                            value={item.quantity || 0}
                            onChange={e => {
                              let qty = Number(e.target.value) || 0;
                              if (qty < 1) qty = 1;
                              const updated = { ...item, quantity: qty, amount: (item.ratePerUnit || 0) * qty };
                              onItemChange(index, { target: { name: "quantity", value: qty, updated } });
                            }}
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

export default ConvertToOrderForm