import React from "react"
import { FaTimes } from "react-icons/fa";
import {
    Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
} from "reactstrap"
import { Spinner } from "reactstrap"
import Select from "react-select"

const InvoiceForm = ({
  title,
  formError,
  formData,
  orderOptions,
  invoiceTypeOptions,
  orderItems,
  totalAmount,
  isEditMode,
  saving,
  onChange,
  onOrderSelectChange,
  onInvoiceTypeSelectChange,
  onSubmit,
  onClose,
}) => {
  return (
     <Card className="mb-4 app-form-card">
           <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h4 className="card-title mb-0">{title}</h4>
              <Button color="link" className="p-0" type="button" onClick={onClose}>
          <FaTimes color="red" size={18} />
        </Button>
      </CardHeader>
        <CardBody className="app-form-body">
        {formError ? (
                 <Alert color="danger">{formError}</Alert>
        ) : null}

        <Form onSubmit={onSubmit}>
          <Row>
              <Col md={6}>
              <FormGroup>
                <Label for="invoiceNumber">Invoice Number <span className="text-danger">*</span></Label>
                <Input
                  type="text"
                  name="invoiceNumber"
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={onChange}
                  readOnly
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Order No. <span style={{ color: "red" }}>*</span></Label>
                <Select
                  classNamePrefix="select2-selection"
                  placeholder="Select order"
                  options={orderOptions}
                  value={orderOptions.find(
                    opt => Number(opt.value) === Number(formData.orderId)
                  ) || null}
                  onChange={onOrderSelectChange}
                  isSearchable
                  isClearable
                />
              </FormGroup>
            </Col>

          

            <Col md={6}>
              <FormGroup>
                <Label>Invoice Type <span style={{ color: "red" }}>*</span></Label>
                <Select
                  classNamePrefix="select2-selection"
                  placeholder="Select invoice type"
                  options={invoiceTypeOptions}
                  value={invoiceTypeOptions.find(
                    opt => Number(opt.value) === Number(formData.invoiceType)
                  ) || null}
                  onChange={onInvoiceTypeSelectChange}
                  isSearchable
                  isClearable
                />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label for="invoiceDate">Invoice Date <span className="text-danger">*</span></Label>
                <Input
                  type="date"
                  name="invoiceDate"
                  id="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={onChange}
max={new Date().toLocaleDateString("en-CA")}
min={(() => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toLocaleDateString("en-CA");
})()}
                  required
                />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label for="dueDate">Due Date <span className="text-danger">*</span></Label>
                <Input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={onChange}
                  required
                />
              </FormGroup>
            </Col>
          </Row>

          {orderItems && orderItems.length > 0 && (
            <>
              <h5 className="mt-4 mb-3">Order Items</h5>
              <div className="table-responsive">
                <Table className="table-sm table-bordered" striped>
                  <thead>
                    <tr>
                      <th style={{ width: "35%" }}>Item Name</th>
                      <th style={{ width: "25%" }}>Price (UMO)</th>
                      <th style={{ width: "15%" }}>Quantity</th>
                      <th style={{ width: "15%" }}>Amount</th>
                      {/* <th style={{ width: "10%" }}>Total</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName || "-"}</td>
                        <td>{item.priceUMO || "-"}</td>
                        <td>{item.quantity || 0}</td>
                        <td>{item.price || 0}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="text-end fw-bold">Total Amount</td>
                      <td className="fw-bold">{totalAmount || 0}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              {/* <div className="mb-3">
                <Input
                  type="text"
                  readOnly
                  value={`Total Amount: ${totalAmount || 0}`}
                />
              </div> */}
                <Row>
                   <Col md={6}>
              <FormGroup>
                <Label for="dueDate">Amount <span className="text-danger">*</span></Label>
                <Input
                  type="text"           
                   value={totalAmount || 0}
                readOnly
                />
              </FormGroup>
            </Col>
                </Row>
              <FormGroup className="mt-3">
                <Label for="notes">Notes</Label>
                <Input
                  type="textarea"
                  name="notes"
                  id="notes"
                  rows="3"
                  value={formData.notes || ""}
                  onChange={onChange}
                />
              </FormGroup>
            </>
          )}

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

export default InvoiceForm