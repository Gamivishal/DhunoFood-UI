import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { setBreadcrumbItems } from "../../store/actions";
import { getCustomerList, getOrderReportPages } from "../../helpers/fakebackend_helper";
import { getLovDropdownList } from "../../helpers/api_helper";
import { showError } from "../../Pop_show/alertService";

const ORDER_REPORT_LIST_SORT_COLUMN = "orderDate";
const ORDER_REPORT_LIST_SORT_DIR = "desc";

const OrderReport = props => {
  document.title = `Order Report`;
  const navigate = useNavigate();
  const location = useLocation();

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("1");
  const [customerList, setCustomerList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(ORDER_REPORT_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(ORDER_REPORT_LIST_SORT_DIR);

  useEffect(() => {
    props.setBreadcrumbItems("Order Report");
    getCustomerList().then(res => {
      if (res.isSuccess && Array.isArray(res.data)) setCustomerList(res.data);
    });
    getLovDropdownList("PaymentStatus").then(res => {
      if (res.isSuccess && Array.isArray(res.data)) setStatusList(res.data);
    });
  }, []);

  const loadOrderReports = async () => {
    setLoading(true);
    setError("");
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

  useEffect(() => {
    loadOrderReports();
  }, [sortColumn, sortColumnDir]);

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
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
              <Row className="mb-3">
                <Col md={3}>
                  <label>From Date</label>
                  <input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </Col>
                <Col md={3}>
                  <label>To Date</label>
                  <input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} />
                </Col>
                <Col md={3}>
                  <label>Customer</label>
                  <select className="form-control" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                    <option value="">All</option>
                    {customerList.map(c => (
                      <option key={c.id || c.customerId} value={c.id || c.customerId}>{c.name || c.customerName}</option>
                    ))}
                  </select>
                </Col>
                <Col md={3}>
                  <label>Status</label>
                  <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="">All</option>
                    {statusList.map(s => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </select>
                </Col>
              </Row>
              <div className="d-flex justify-content-end mb-3">
                <Button color="primary" type="button" onClick={loadOrderReports}>
                  <i className="mdi mdi-magnify me-1" />Search
                </Button>
              </div>
              {error ? <Alert color="danger">{error}</Alert> : null}
              {loading ? (
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
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(OrderReport);
