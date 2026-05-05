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
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap"

const ExpenseCategoryForm = ({
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
            <Col md={12}>
              <Label>Category Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="categoryName"
                value={formData.categoryName}
                onChange={onChange}
                placeholder="Enter category name"
                maxLength={100}
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

export default ExpenseCategoryForm