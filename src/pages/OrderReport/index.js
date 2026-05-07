import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Form, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import Select from "react-select";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { setBreadcrumbItems } from "../../store/actions";
import { getCustomerList, getOrderReportPages, OrderReportExportToExcel, OrderReportExportToPdf } from "../../helpers/fakebackend_helper";
import { getLovDropdownList } from "../../helpers/api_helper";

const ORDER_REPORT_LIST_SORT_COLUMN = "orderDate";
const ORDER_REPORT_LIST_SORT_DIR = "desc";

const OrderReport = props => {
  document.title = `Order Report`;
  const navigate = useNavigate();
  const location = useLocation();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(ORDER_REPORT_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(ORDER_REPORT_LIST_SORT_DIR);

  useEffect(() => {
    props.setBreadcrumbItems("Order Report");
    getCustomerList().then(res => {
      if (res.isSuccess && Array.isArray(res.data)) {
        setCustomerList(res.data.map(c => ({ value: c.id || c.customerId, label: c.name || c.customerName })));
      }
    });
    getLovDropdownList("PaymentStatus").then(res => {
      if (res.isSuccess && Array.isArray(res.data)) {
        setStatusList(res.data.map(s => ({ value: s.code, label: s.name })));
      }
    });
  }, []);

  const loadOrderReports = async () => {
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const response = await getOrderReportPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
        fromDate,
        toDate,
        customerId,
        status,
      });
      if (response.isSuccess && response.data && response.data.data) {
        setRows(response.data.data);
      } else {
        setRows([]);
        setError(response.message || "Failed to load Order Reports.");
      }
    } catch (err) {
      setError("Error loading Order Reports.");
    }
    setLoading(false);
  };

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  useEffect(() => {
    if (hasSearched) {
      loadOrderReports();
    }
  }, [sortColumn, sortColumnDir]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fromDate") setFromDate(value);
    if (name === "toDate") setToDate(value);
  };

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Order No", field: "orderNo", sort: "asc" },
          { label: "Customer Name", field: "customerName", sort: "asc" },
          { label: "Order Date", field: "orderDate", sort: "asc" },
          { label: "Total Amount", field: "totalAmount", sort: "asc" },
          { label: "Payment Status", field: "paymentStatusname", sort: "asc" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        orderNo: item.orderNo,
        customerName: item.customerName,
        orderDate: item.orderDate?.split("T")[0] || "",
        totalAmount: item.totalAmount,
        paymentStatusname: item.paymentStatusname,
      })),
    });
  }, [rows, sortColumn, sortColumnDir]);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>
              <Form onSubmit={(e) => { e.preventDefault(); loadOrderReports(); }}>
               <Row>
                <Col >
                    <FormGroup>
                      <Label>From Date</Label>
                      <Input type="date" name="fromDate" value={fromDate} onChange={handleChange} />
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Label>To Date</Label>
                      <Input type="date" name="toDate" value={toDate} onChange={handleChange} />
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Label>Customer</Label>
                      <Select
                        classNamePrefix="select2-selection"
                        placeholder="Select Customer"
                        options={customerList}
                        value={customerList.find(c => c.value === customerId) || null}
                        onChange={option => setCustomerId(option ? option.value : "")}
                        isClearable
                      />
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Label>Status</Label>
                      <Select
                        classNamePrefix="select2-selection"
                        placeholder="Select Status"
                        options={statusList}
                        value={statusList.find(s => s.value === status) || null}
                        onChange={option => setStatus(option ? option.value : "")}
                        isClearable
                      />
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Label>&nbsp;</Label>
                      <Button
                        color="primary"
                        type="submit"
                        disabled={loading}
                        className="w-100"
                        style={{ height: "38px", borderRadius: "0.375rem" }}
                      >
                        {loading ? "..." : "Search"}
                      </Button>
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
              {hasSearched && rows && rows.length > 0 && (
                <div className="d-flex justify-content-end mb-3 gap-2">
                  <Button color="info" type="button" onClick={() => OrderReportExportToPdf({ fromDate, toDate, customerId, status, sortColumn, sortColumnDir })}>
                    <i className="mdi mdi-file-pdf-box me-1" />PDF
                  </Button>
                  <Button color="success" type="button" onClick={() => OrderReportExportToExcel({ fromDate, toDate, customerId, status, sortColumn, sortColumnDir })}>
                    <i className="mdi mdi-file-excel me-1" />Excel
                  </Button>
                </div>
              )}
              {error ? <Alert color="danger">{error}</Alert> : null}
              {hasSearched && (
                loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <MDBDataTable
                    striped
                    bordered
                    small
                    noBottomColumns
                    data={data}
                    className={rows && rows.length > 0 ? "table-auto-sr" : undefined}
                    noRecordsFoundLabel={<span style={{display: 'block', textAlign: 'center', fontWeight: 'bold', color: '#888'}}>You don't have any record</span>}
                  />
                )
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(OrderReport);