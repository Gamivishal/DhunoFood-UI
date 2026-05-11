import React, { useEffect, useState } from "react";
import Select from "react-select";
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
  Spinner,
} from "reactstrap"
import { getRoleDropdownList } from "../../helpers/api_helper";

const UserForm = ({
  title,
  formError,
  formData,
  roleOptions,
  isEditMode,
  saving,
  onChange,
  onRoleChange,
  onSubmit,
  onClose,
}) => {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    setLoadingRoles(true);
    getRoleDropdownList()
      .then(data => {
        if (data && data.data) {
          setRoles(data.data);
        } else {
          setRoles([]);
        }
        setLoadingRoles(false);
      })
      .catch(() => {
        setRoles([]);
        setLoadingRoles(false);
        setRoleError("Failed to load roles");
      });
  }, []);

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
              <Label>User Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="userName"
                value={formData.userName}
                onChange={onChange}
                placeholder="Enter user name"
              />
            </Col>
            {!isEditMode && (
              <Col md={6}>
                <Label>Password<span style={{ color: "red" }}>*</span></Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="Enter password"
                />
              </Col>
            )}
            <Col md={6}>
              <Label>Email</Label>
              <Input
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter email"
              />
            </Col>
            <Col md={6}>
              <Label>Mobile Number</Label>
              <Input
                name="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  onChange({
                    target: {
                      name: e.target.name,
                      value,
                    },
                  });
                }}
                placeholder="Enter mobile number"
                maxLength={10}
              />
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Select Role<span style={{ color: "red" }}>*</span></Label>
                <Select
                  classNamePrefix="select2-selection"
                  placeholder="Select role"
                  options={roles.map(role => ({ value: role.id, label: role.name }))}
                  value={
                    roles && roles.length && formData.roleId
                      ? roles.map(role => ({ value: role.id, label: role.name })).find(opt => Number(opt.value) === Number(formData.roleId)) || null
                      : null
                  }
                  onChange={option => {
                    if (onRoleChange) {
                      onRoleChange(option);
                    } else {
                      onChange({
                        target: {
                          name: "roleId",
                          value: option ? Number(option.value) : "",
                        },
                      });
                    }
                  }}
                  isSearchable
                  isClearable
                />
                {roleError && <div style={{ color: "red", fontSize: "0.9em" }}>{roleError}</div>}
              </FormGroup>
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

export default UserForm
