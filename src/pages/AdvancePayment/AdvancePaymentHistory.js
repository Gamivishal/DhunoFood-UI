import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Row, Spinner, Alert } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import { buildServerSortColumns, withAutoSrColumn } from "../../common/common";
import { getAdvancePaymentHistoryPages } from '../../helpers/fakebackend_helper';

const AdvancePaymentHistory = () => {
  const location = useLocation();
const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ GET AdvancePaymentId FROM URL
  const queryParams = new URLSearchParams(location.search);
  const advancePaymentId = queryParams.get("AdvancePaymentId") || 0;

  // ✅ LOAD DATA
  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdvancePaymentHistoryPages({
        start: 0,
        length: 10,
        AdvancePaymentId: advancePaymentId,
      });

      if (response?.isSuccess && response?.data?.data) {
        setRows(response.data.data);
      } else {
        setRows([]);
      }
    } catch (err) {
      setError("Failed to load history");
      setRows([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [advancePaymentId]);

  // ✅ TABLE DATA
  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Invoice", field: "invoiceNumber", sort: "asc" },
          { label: "Customer Name", field: "customerName", sort: "asc" },
          { label: "Payment Date", field: "paymentDate", sort: "asc" },
          { label: "Amount", field: "amount", sort: "asc" },
          { label: "Payment Mode", field: "paymentModeName", sort: "asc" },
          { label: "Reference No", field: "referenceNo", sort: "asc" },
        ],
      }),

      rows: rows.map((item) => ({
        ...item,
        paymentDate: item.paymentDate
          ? item.paymentDate.split("T")[0] // ✅ format date
          : "",
      })),
    });
  }, [rows]);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>
                <div className="d-flex justify-content-end mb-3">
    <Button
      color="secondary"
      onClick={() => navigate("/AdvancePayment")}
    >
      ← Back
    </Button>
  </div>
              {error && <Alert color="danger">{error}</Alert>}

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
                  className={rows.length > 0 ? "table-auto-sr" : undefined}
                  noRecordsFoundLabel={
                    <span
                      style={{
                        display: "block",
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#888",
                      }}
                    >
                      You don't have any record
                    </span>
                  }
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default AdvancePaymentHistory;