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
  onCustomItemSave,
}) => {
  const [customItemModal, setCustomItemModal] = useState(false)
  const [customItemName, setCustomItemName] = useState("")
  const [pendingItemIndex, setPendingItemIndex] = useState(null)
  const [pendingItemData, setPendingItemData] = useState(null)

  const itemSelectOptions = (itemOptions || []).map(item => ({
    value: item.itemId || item.id,
    label: item.itemName || item.name,
    price: item.price,
    baseQty: item.baseQty,
    ratePerUnit: item.ratePerUnit,
    unit: item.unit,
    priceUMO: item.priceUMO,
    umo: item.umo || item.priceUMO || "",
    iscustome: item.iscustome || false,
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
    
    if (selectedItem?.iscustome === true) {
      setPendingItemIndex(index)
      setPendingItemData({
        itemId: option?.value || 0,
        price: selectedItem?.price || 0,
        baseQty: selectedItem?.baseQty || 0,
        ratePerUnit: selectedItem?.ratePerUnit || 0,
        unit: selectedItem?.unit || "",
        priceUMO: selectedItem?.priceUMO || "",
        umo: selectedItem?.umo || "",
        amount: "",
      })
      setCustomItemName("")
      setCustomItemModal(true)
      return
    }
    
    const currentItem = formData.items[index] || {}
    const baseQty = selectedItem?.baseQty || 0
    const ratePerUnit = selectedItem?.ratePerUnit || 0
    const unit = selectedItem?.unit || ""
    const priceUMO = selectedItem?.priceUMO || ""
    const umo = selectedItem?.umo || ""
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
          umo: umo,
          iscustome: selectedItem?.iscustome || false,
        })
      }
    })
  }

  const handleCustomItemSave = () => {
    if (!customItemName.trim()) return
    
    const quantity = pendingItemData?.baseQty || 1
    const amount = pendingItemData?.amount !== undefined && pendingItemData?.amount !== "" ? Number(pendingItemData.amount) : (Number(pendingItemData?.price) || 0)
    const ratePerUnit = amount / quantity
    
    onCustomItemSave(pendingItemIndex, {
      itemId: pendingItemData?.itemId || 0,
      itemName: customItemName.trim(),
      price: ratePerUnit,
      baseQty: quantity,
      quantity: quantity,
      ratePerUnit: ratePerUnit,
      amount: amount,
      unit: pendingItemData?.unit || "",
      priceUMO: ratePerUnit.toString(),
      umo: ratePerUnit.toString(),
      iscustome: true,
    })
    
    setCustomItemModal(false)
    setCustomItemName("")
    setPendingItemIndex(null)
    setPendingItemData(null)
  }

  const handleCustomItemCancel = () => {
    setCustomItemModal(false)
    setCustomItemName("")
    setPendingItemIndex(null)
    setPendingItemData(null)
  }

  const handleQuantityChange = (index, e, isCustom) => {
    const value = e.target.value
    const qty = value === '' ? null : (value === '0' ? 0 : (Number(value) || null))
    const currentItem = formData.items[index] || {}
    const ratePerUnit = currentItem.ratePerUnit || 0
    
    onItemChange(index, {
      target: {
        name: "baseQty",
        value: JSON.stringify({
          baseQty: qty,
          quantity: qty,
          amount: isCustom ? currentItem.amount : (qty !== null ? ratePerUnit * qty : 0),
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
                max={new Date().toLocaleDateString("en-CA")}
min={(() => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toLocaleDateString("en-CA");
})()}
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
                      <th style={{ width: "130px" }}>Price (Qty)</th>
                      <th style={{ width: "100px" }}>Quantity</th>
                      <th className="d-none" style={{ width: "100px" }}>Rate/Unit</th>
                      <th style={{ width: "120px" }}>Amount</th>
                      <th style={{ width: "60px" }}>Action</th>
                    </tr>
                    
                  </thead>
<tbody>
                    {(formData.items || []).map((item, index) => {
                      const selectedOption = itemSelectOptions.find(
                        opt => Number(opt.value) === Number(item.itemId)
                      )
                      const displayLabel = item.itemName || selectedOption?.label || ""
                      return (
                        <tr key={index}>
                          <td>
                            <Select
                              classNamePrefix="select2-selection"
                              placeholder="Select item"
                              options={itemSelectOptions}
                              value={item.itemId > 0 ? { value: item.itemId, label: displayLabel } : null}
                              onChange={option => handleItemSelectChange(index, option)}
                              menuPlacement="auto"
                              menuShouldScrollIntoView={false}
                              styles={{ menu: (provided) => ({ ...provided, maxHeight: 300, zIndex: 9999 }) }}
                              menuPortalTarget={typeof window !== 'undefined' ? window.document.body : null}
                              menuPosition="fixed"
                              isSearchable
                              isClearable
                            />
                          </td>
<td>
                            <Input
                              type="text"
                              name="price"
                              value={selectedOption?.iscustome ? (selectedOption?.umo || item.umo || item.priceUMO || "") : (item.priceUMO || 0)}
                              readOnly
                            />
                          </td>
                        <td>
                          <Input
                            type="text"
                            name="baseQty"
                            value={item.quantity ?? item.baseQty ?? ''}
                            onChange={e => handleQuantityChange(index, e, selectedOption?.iscustome)}
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
                            value={
                              selectedOption?.iscustome
                                ? (item.amount != null && item.amount !== 0 && item.amount !== "") ? Math.round(item.amount) : ""
                                : (item.ratePerUnit != null && item.quantity != null) ? Math.round(Number(item.ratePerUnit) * Number(item.quantity)) : ""
                            }
                            readOnly={!selectedOption?.iscustome}
                            onChange={e => {
                              if (selectedOption?.iscustome) {
                                onItemChange(index, {
                                  target: {
                                    name: "amount",
                                    value: e.target.value
                                  }
                                })
                              }
                            }}
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
                      )
                    })}
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

      <Modal isOpen={customItemModal} toggle={handleCustomItemCancel}>
        <ModalHeader toggle={handleCustomItemCancel}>Enter Custom Item Details</ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <Label>Item Name<span style={{ color: "red" }}>*</span></Label>
            <Input
              type="text"
              placeholder="Enter item name"
              value={customItemName}
              onChange={e => setCustomItemName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mb-3">
            <Label>Quantity</Label>
            <Input
              type="number"
              placeholder="Enter quantity"
              value={pendingItemData?.baseQty || ""}
              onChange={e => setPendingItemData(prev => ({ ...prev, baseQty: Number(e.target.value) || 0 }))}
              min={1}
            />
          </div>
          <div className="mb-3">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={pendingItemData?.amount !== undefined ? pendingItemData.amount : ""}
              onChange={e => setPendingItemData(prev => ({ ...prev, amount: e.target.value === "" ? "" : Number(e.target.value) }))}
              min={0}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="light" type="button" onClick={handleCustomItemCancel}>
            Cancel
          </Button>
          <Button color="primary" type="button" onClick={handleCustomItemSave} disabled={!customItemName.trim()}>
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  )
}

export default QuotationForm