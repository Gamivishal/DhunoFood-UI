import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Form, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import Select from "react-select";
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
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(EXPENSE_REPORT_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(EXPENSE_REPORT_LIST_SORT_DIR);

  useEffect(() => {
    props.setBreadcrumbItems("Expense Report");
    getExpenseCategoryPages({ length: 100 }).then(res => {
      if (res.isSuccess && res.data && res.data.data) {
        setCategoryList(res.data.data.map(c => ({ value: c.expenseCategoryId, label: c.categoryName })));
      }
    });
    getLovDropdownList("PaymentMode").then(res => {
      if (res.isSuccess && Array.isArray(res.data)) {
        setPaymentModeList(res.data.map(p => ({ value: p.code, label: p.name })));
      }
    });
  }, []);

  const loadExpenseReports = async () => {
    setLoading(true);
    setError("");
    setHasSearched(true);
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

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  useEffect(() => {
    if (hasSearched) {
      loadExpenseReports();
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
              <Form onSubmit={(e) => { e.preventDefault(); loadExpenseReports(); }}>
                <Row>
                  <Col md={3}>
                    <FormGroup>
                      <Label>From Date</Label>
                      <Input type="date" name="fromDate" value={fromDate} onChange={handleChange} />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>To Date</Label>
                      <Input type="date" name="toDate" value={toDate} onChange={handleChange} />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <Label>Category</Label>
                      <Select
                        classNamePrefix="select2-selection"
                        placeholder="Select Category"
                        options={categoryList}
                        value={categoryList.find(c => c.value === categoryId) || null}
                        onChange={option => setCategoryId(option ? option.value : "")}
                        isClearable
                      />
                    </FormGroup>
                  </Col>
                  
                  <Col md={3}>
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
                  <Button color="info" type="button" onClick={() => ExpenseReportExportToPdf({ fromDate, toDate, categoryId, paymentMode, sortColumn, sortColumnDir })}>
                    <i className="mdi mdi-file-pdf-box me-1" />PDF
                  </Button>
                  <Button color="success" type="button" onClick={() => ExpenseReportExportToExcel({ fromDate, toDate, categoryId, paymentMode, sortColumn, sortColumnDir })}>
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
                  <>
                    {rows && rows.length > 0 && rows[0].totalExpenseAmount !== undefined && (
                      <div className="d-flex justify-content-end mb-2">
                        <span className="badge bg-success" style={{ fontSize: "14px", padding: "8px 16px" }}>
                          Total: ₹{rows[0].totalExpenseAmount?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <MDBDataTable
                      striped
                      bordered
                      small
                      noBottomColumns
                      data={data}
                      className={rows && rows.length > 0 ? "table-auto-sr" : undefined}
                      noRecordsFoundLabel={<span style={{display: 'block', textAlign: 'center', fontWeight: 'bold', color: '#888'}}>You don't have any record</span>}
                    />
                    
                  </>
                )
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(ExpenseReport);