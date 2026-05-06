import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { setBreadcrumbItems } from "../../store/actions";
import { getExpenseCategoryPages, getExpenseReportPages, ExpenseReportExportToExcel, ExpenseReportExportToPdf } from "../../helpers/fakebackend_helper";
import { getLovDropdownList } from "../../helpers/api_helper";

const EXPENSE_REPORT_LIST_SORT_COLUMN = "expenseDate";
const EXPENSE_REPORT_LIST_SORT_DIR = "desc";

const ExpenseReport = props => {
  document.title = `Expense Report`;
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [paymentModeList, setPaymentModeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(EXPENSE_REPORT_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(EXPENSE_REPORT_LIST_SORT_DIR);

  useEffect(() => {
    props.setBreadcrumbItems("Expense Report");
    getExpenseCategoryPages({ length: 100 }).then(res => {
      if (res.isSuccess && res.data && res.data.data) setCategoryList(res.data.data);
    });
    getLovDropdownList("PaymentMode").then(res => {
      if (res.isSuccess && Array.isArray(res.data)) setPaymentModeList(res.data);
    });
  }, []);

  const loadExpenseReports = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getExpenseReportPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
        fromDate,
        toDate,
        categoryId,
      });
      if (response.isSuccess && response.data && response.data.data) {
        setRows(response.data.data);
      } else {
        setRows([]);
        setError(response.message || "Failed to load Expense Reports.");
      }
    } catch (err) {
      setError("Error loading Expense Reports.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExpenseReports();
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
          { label: "Expense Date", field: "expenseDate", sort: "asc" },
          { label: "Category", field: "categoryName", sort: "asc" },
          { label: "Payment Mode", field: "paymentModeName", sort: "asc" },
          { label: "Amount", field: "amount", sort: "asc" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        expenseDate: item.expenseDate?.split("T")[0] || "",
        categoryName: item.categoryName,
        paymentModeName: item.paymentModeName,
        amount: item.amount,
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
                  <label>Category</label>
                  <select className="form-control" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">All</option>
                    {categoryList.map(c => (
                      <option key={c.expenseCategoryId} value={c.expenseCategoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </Col>
                <Col md={3}>
                  <label>Payment Mode</label>
                  <select className="form-control" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                    <option value="">All</option>
                    {paymentModeList.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </Col>
              </Row>
              <div className="d-flex justify-content-end mb-3 gap-2">
                <Button color="primary" type="button" onClick={loadExpenseReports}>
                  <i className="mdi mdi-magnify me-1" />Search
                </Button>
                <Button color="info" type="button" onClick={() => ExpenseReportExportToPdf({ fromDate, toDate, categoryId, paymentMode })}>
                  <i className="mdi mdi-file-pdf-box me-1" />PDF
                </Button>
                <Button color="success" type="button" onClick={() => ExpenseReportExportToExcel({ fromDate, toDate, categoryId, paymentMode })}>
                  <i className="mdi mdi-file-excel me-1" />Excel
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

export default connect(null, { setBreadcrumbItems })(ExpenseReport);