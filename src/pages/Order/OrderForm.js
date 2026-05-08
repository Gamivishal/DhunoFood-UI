import React, { useState } from "react"
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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
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
  onCancelOrder,
  onCompleteOrder,
}) => {
  const [cancelModal, setCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [confirmCancelModal, setConfirmCancelModal] = useState(false)

  const itemSelectOptions = (itemOptions || []).map(item => ({
    value: item.itemId || item.id,
    label: item.itemName || item.name,
    price: item.price,
    baseQty: item.baseQty,
    ratePerUnit: item.ratePerUnit,
    unit: item.unit,
    priceUMO: item.priceUMO,
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
    const baseQty = selectedItem?.baseQty || 0
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
          baseQty: baseQty,
          quantity: baseQty,
          ratePerUnit: ratePerUnit,
          amount: ratePerUnit * baseQty,
          unit: unit,
          priceUMO: priceUMO,
        })
      }
    })
  }

  const handleQuantityChange = (index, e) => {
    const value = e.target.value
    let qty = value === '' ? null : Number(value)
    if (qty !== null && (isNaN(qty) || qty < 1)) qty = 1
    const currentItem = formData.items[index] || {}
    const ratePerUnit = currentItem.ratePerUnit || 0
    onItemChange(index, {
      target: {
        name: "quantity",
        value: JSON.stringify({
          baseQty: qty,
          quantity: qty,
          amount: qty !== null ? ratePerUnit * qty : null,
        })
      }
    })
  }

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
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
                min={new Date().toLocaleDateString("en-CA")}
              />
            </Col>
            <Col md={6}>
              <Label>Order Time<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="time"
                name="orderTime"
                value={formData.orderTime ? formData.orderTime.substring(0, 5) : ""}
                onChange={onChange}
              />
            </Col>
            {isEditMode && (
              <Col md={6} className="d-none">
                <Label>Status<span style={{ color: "red" }}>*</span></Label>
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
            )}
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
                      <th style={{ width: "150px" }}>Price (Qty)</th>
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
                            menuPlacement="auto"
                            menuShouldScrollIntoView={false}
                            styles={{ menu: (provided) => ({ ...provided, maxHeight: 300, zIndex: 9999 }) }}
                            menuPortalTarget={typeof window !== 'undefined' ? window.document.body : null}
                            menuPosition="fixed"
                          />
                        </td>
                        <td>
                          <Input
                            type="text"
                            name="price"
                              value={item.priceUMO || 0}
                          //  value={item.priceUMO || (item.baseQty && item.unit ? `${item.price || 0} (${item.baseQty} ${item.unit})` : item.price || 0)}
                            readOnly
                          />
                        </td>
                        <td>
                          <Input
                            type="text"
                            name="quantity"
                            value={item.quantity ?? item.baseQty ?? ''}
                            onChange={e => handleQuantityChange(index, e)}
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
                            value={item.amount != null ? Math.round(item.amount) : ""}
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
                <span className="ms-2">{Math.round(calculateTotal())}</span>
              </div>
            </Col>
          </Row>

<div className="app-form-actions">
            
            {isEditMode && (
              <>
                <Button color="success" type="button" onClick={onCompleteOrder} disabled={saving}>
                  Complete Order
                </Button>
              </>
            )}
            <Button color="success" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
             {isEditMode && (
              <>
                <Button color="danger" type="button" onClick={() => setConfirmCancelModal(true)}>
                  Cancel Order
                </Button>

              </>
            )}
          </div>
        </Form>
      </CardBody>

      <Modal isOpen={confirmCancelModal} toggle={() => setConfirmCancelModal(false)}>
        <ModalHeader toggle={() => setConfirmCancelModal(false)}>Cancel Order</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to cancel this order?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" type="button" onClick={() => setConfirmCancelModal(false)}>
            No
          </Button>
          <Button color="warning" type="button" onClick={() => { setConfirmCancelModal(false); setCancelModal(true); }}>
            Yes
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={cancelModal} toggle={() => setCancelModal(false)}>
        <ModalHeader toggle={() => setCancelModal(false)}>Cancel Order</ModalHeader>
        <ModalBody>
          <Label>Reason for cancellation</Label>
          <Input
            type="textarea"
            rows="4"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancellation"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="light" type="button" onClick={() => setCancelModal(false)}>
            No
          </Button>
          <Button color="warning" type="button" onClick={() => { onCancelOrder(cancelReason); setCancelModal(false); }} disabled={!cancelReason.trim()}>
            Yes, Cancel Order
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  )
}

export default OrderForm