"use client";

import { useMemo, useState } from "react";

import {
  Add,
  AccessTime,
  CalendarMonth,
  CameraAlt,
  CheckCircle,
  DeleteOutlined,
  EditOutlined,
  Groups,
  Logout,
  Person,
  Visibility,
} from "@mui/icons-material";

import {
  useAttendance,
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useSaveAttendance,
  useUpdateEmployee,
} from "@/lib/hooks/useEmployees";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

/* =========================================================
   TYPES
========================================================= */

type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Off"
  | "Half Day"
  | "Late";

type Employee = {
  id: number;
  name: string;
  phone: string;
  cnic: string;
  designation: string;
  salary: number;
  joiningDate: string;
  image: string;
};

type Attendance = {
  id: number;
  employeeId: number;
  date: string;
  inTime: string;
  outTime: string;
  status: AttendanceStatus;
};

type EmployeeForm = {
  name: string;
  phone: string;
  cnic: string;
  designation: string;
  salary: string;
  joiningDate: string;
  image: string;
};

/* =========================================================
   INITIAL DATA
========================================================= */

const initialEmployees: Employee[] = [];
const initialAttendance: Attendance[] = [];

const emptyForm: EmployeeForm = {
  name: "",
  phone: "",
  cnic: "",
  designation: "",
  salary: "",
  joiningDate: new Date().toISOString().split("T")[0],
  image: "",
};

/* =========================================================
   PAGE
========================================================= */

export default function EmployeesPage() {
  const { data: employees = initialEmployees } = useEmployees();
  const { data: attendance = initialAttendance } = useAttendance();
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const saveAttendanceMutation = useSaveAttendance();

  const [employeeDialog, setEmployeeDialog] =
    useState(false);

  const [attendanceDialog, setAttendanceDialog] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [form, setForm] =
    useState<EmployeeForm>(emptyForm);

  /* =======================================================
     PRICE
  ======================================================= */

  const formatPrice = (value: number) => {
    return `Rs. ${value.toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;
  };

  /* =======================================================
     DATE
  ======================================================= */

  const getToday = () => {
    return new Date()
      .toISOString()
      .split("T")[0];
  };

  /* =======================================================
     TIME
  ======================================================= */

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString(
      "en-PK",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (
    field: keyof EmployeeForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        image: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  /* =======================================================
     ADD EMPLOYEE
  ======================================================= */

  const openAddEmployee = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      joiningDate: getToday(),
    });

    setEmployeeDialog(true);
  };

  /* =======================================================
     EDIT EMPLOYEE
  ======================================================= */

  const openEditEmployee = (
    employee: Employee
  ) => {
    setEditingId(employee.id);

    setForm({
      name: employee.name,
      phone: employee.phone,
      cnic: employee.cnic,
      designation: employee.designation,
      salary: String(employee.salary),
      joiningDate: employee.joiningDate,
      image: employee.image,
    });

    setEmployeeDialog(true);
  };

  /* =======================================================
     CLOSE EMPLOYEE DIALOG
  ======================================================= */

  const closeEmployeeDialog = () => {
    setEmployeeDialog(false);
    setEditingId(null);
    setForm({
      ...emptyForm,
    });
  };

  /* =======================================================
     SAVE EMPLOYEE
  ======================================================= */

  const saveEmployee = async () => {
    if (createEmployeeMutation.isPending || updateEmployeeMutation.isPending) return;

    const name = form.name.trim();
    const phone = form.phone.trim();
    const cnic = form.cnic.trim();
    const designation = form.designation.trim();
    const salary = Number(form.salary);

    if (!name || !phone || !designation || !Number.isFinite(salary) || salary <= 0) {
      alert("Please enter all required employee details.");
      return;
    }

    try {
      const payload = {
        name,
        phone,
        cnic,
        designation,
        salary,
        joiningDate: form.joiningDate,
        image: form.image,
      };

      if (editingId !== null) {
        await updateEmployeeMutation.mutateAsync({
          id: editingId,
          payload: {
            name,
            phone,
            cnic,
            designation,
            salary,
            joiningDate: form.joiningDate,
            image: form.image,
          },
        });
      } else {
        await createEmployeeMutation.mutateAsync({
          name,
          phone,
          cnic,
          designation,
          salary,
          joiningDate: form.joiningDate,
          image: form.image,
        });
      }

      closeEmployeeDialog();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to save employee.");
    }
  };

  /* =======================================================
     DELETE EMPLOYEE
  ======================================================= */

  const deleteEmployee = async (employeeId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    try {
      await deleteEmployeeMutation.mutateAsync(employeeId);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to delete employee.");
    }
  };

  /* =======================================================
     TODAY ATTENDANCE
  ======================================================= */

  const getTodayAttendance = (
    employeeId: number
  ) => {
    return attendance.find(
      (record) =>
        record.employeeId === employeeId &&
        record.date === getToday()
    );
  };

  /* =======================================================
     CHECK IN
  ======================================================= */

  const checkIn = async (employee: Employee) => {
    const today = getToday();
    const existing = getTodayAttendance(employee.id);

    if (existing) {
      alert("Employee has already checked in today.");
      return;
    }

    try {
      await saveAttendanceMutation.mutateAsync({
        employeeId: employee.id,
        date: today,
        inTime: getCurrentTime(),
        outTime: "",
        status: "Present",
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to check in.");
    }
  };

  /* =======================================================
     CHECK OUT
  ======================================================= */

  const checkOut = async (employee: Employee) => {
    const today = getToday();
    const existing = getTodayAttendance(employee.id);

    if (!existing) {
      alert("Employee has not checked in today.");
      return;
    }

    if (existing.outTime) {
      alert("Employee has already checked out today.");
      return;
    }

    try {
      await saveAttendanceMutation.mutateAsync({
        employeeId: employee.id,
        date: today,
        inTime: existing.inTime,
        outTime: getCurrentTime(),
        status: existing.status,
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to check out.");
    }
  };

  /* =======================================================
     OPEN ATTENDANCE
  ======================================================= */

  const openAttendance = (
    employee: Employee
  ) => {
    setSelectedEmployee(employee);
    setAttendanceDialog(true);
  };

  const closeAttendance = () => {
    setAttendanceDialog(false);
    setSelectedEmployee(null);
  };

  /* =======================================================
     MARK STATUS
  ======================================================= */

  const markAttendance = async (employeeId: number, date: string, status: AttendanceStatus) => {
    const existing = attendance.find((record) => record.employeeId === employeeId && record.date === date);

    try {
      await saveAttendanceMutation.mutateAsync({
        employeeId,
        date,
        inTime: existing?.inTime || "",
        outTime: existing?.outTime || "",
        status,
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to mark attendance.");
    }
  };

  /* =======================================================
     WORKING HOURS
  ======================================================= */

  const calculateHours = (
    inTime: string,
    outTime: string
  ) => {
    if (!inTime || !outTime) {
      return "-";
    }

    const parseTime = (
      time: string
    ) => {
      const parts = time.match(
        /(\d+):(\d+)\s?(AM|PM)/i
      );

      if (!parts) {
        return 0;
      }

      let hour = Number(parts[1]);
      const minute = Number(parts[2]);
      const period =
        parts[3].toUpperCase();

      if (period === "PM" && hour !== 12) {
        hour += 12;
      }

      if (period === "AM" && hour === 12) {
        hour = 0;
      }

      return hour * 60 + minute;
    };

    const start = parseTime(inTime);
    const end = parseTime(outTime);

    let difference = end - start;

    if (difference < 0) {
      difference += 24 * 60;
    }

    const hours =
      Math.floor(difference / 60);

    const minutes =
      difference % 60;

    return `${hours}h ${minutes}m`;
  };

  /* =======================================================
     MONTH RECORD
  ======================================================= */

  const monthRecords = useMemo(() => {
    if (!selectedEmployee) {
      return [];
    }

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    const records = [];

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      const date =
        `${year}-${String(
          month + 1
        ).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;

      const existing =
        attendance.find(
          (record) =>
            record.employeeId ===
              selectedEmployee.id &&
            record.date === date
        );

      const dateObject =
        new Date(
          year,
          month,
          day
        );

      const dayName =
        dateObject.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        );

      records.push({
        date,
        dayName,
        record: existing,
      });
    }

    return records;
  }, [
    selectedEmployee,
    attendance,
  ]);

  /* =======================================================
     SALARY SUMMARY
  ======================================================= */

  const salarySummary = useMemo(() => {
    if (!selectedEmployee) {
      return {
        present: 0,
        absent: 0,
        off: 0,
        halfDay: 0,
        late: 0,
        deduction: 0,
        finalSalary: 0,
      };
    }

    const records =
      monthRecords;

    let present = 0;
    let absent = 0;
    let off = 0;
    let halfDay = 0;
    let late = 0;

    records.forEach(
      ({ record }) => {
        if (!record) {
          return;
        }

        if (
          record.status ===
          "Present"
        ) {
          present++;
        }

        if (
          record.status ===
          "Absent"
        ) {
          absent++;
        }

        if (
          record.status === "Off"
        ) {
          off++;
        }

        if (
          record.status ===
          "Half Day"
        ) {
          halfDay++;
        }

        if (
          record.status === "Late"
        ) {
          late++;
        }
      }
    );

    const daysInMonth =
      records.length;

    const dailySalary =
      selectedEmployee.salary /
      daysInMonth;

    const deduction =
      absent * dailySalary +
      halfDay * dailySalary * 0.5;

    const finalSalary =
      selectedEmployee.salary -
      deduction;

    return {
      present,
      absent,
      off,
      halfDay,
      late,
      deduction,
      finalSalary,
    };
  }, [
    selectedEmployee,
    monthRecords,
  ]);

  /* =======================================================
     PAGE SUMMARY
  ======================================================= */

  const pageSummary = useMemo(() => {
    let totalSalary = 0;
    let presentToday = 0;
    let checkedOutToday = 0;

    employees.forEach(
      (employee) => {
        totalSalary +=
          employee.salary;

        const today =
          attendance.find(
            (record) =>
              record.employeeId === employee.id &&
              record.date === new Date().toISOString().split("T")[0]
          );

        if (today) {
          presentToday++;

          if (today.outTime) {
            checkedOutToday++;
          }
        }
      }
    );

    return {
      totalEmployees:
        employees.length,
      totalSalary,
      presentToday,
      checkedOutToday,
    };
  }, [
    employees,
    attendance,
  ]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        sx={{
          justifyContent:
            "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems:
                "center",
            }}
          >
            <Groups color="primary" />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              Employees
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage employees,
            attendance and salary
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={
            openAddEmployee
          }
        >
          Add Employee
        </Button>
      </Stack>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 4,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor:
                "divider",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Employees
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {
                  pageSummary.totalEmployees
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor:
                "success.main",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Present Today
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color:
                    "success.main",
                }}
              >
                {
                  pageSummary.presentToday
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor:
                "primary.main",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Checked Out
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color:
                    "primary.main",
                }}
              >
                {
                  pageSummary.checkedOutToday
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor:
                "warning.main",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Monthly Payroll
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  color:
                    "warning.main",
                  fontSize: {
                    xs: "1.25rem",
                    sm: "1.5rem",
                  },
                }}
              >
                {formatPrice(
                  pageSummary.totalSalary
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =================================================
          EMPLOYEE CARDS
      ================================================= */}

      {employees.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 3,
            py: 12,
            textAlign: "center",
          }}
        >
          <Groups
            sx={{
              fontSize: 65,
              color:
                "text.disabled",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              mt: 1,
              fontWeight: 600,
            }}
          >
            No employees yet
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
            }}
          >
            Add your first
            employee to start
            managing attendance
            and salary.
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={
              openAddEmployee
            }
          >
            Add Employee
          </Button>
        </Paper>
      ) : (
        <Grid
          container
          spacing={3}
        >
          {employees.map(
            (employee) => {
              const today =
                getTodayAttendance(
                  employee.id
                );

              return (
                <Grid
                  key={
                    employee.id
                  }
                  size={{
                    xs: 12,
                    sm: 6,
                    lg: 4,
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border:
                        "1px solid",
                      borderColor:
                        "divider",
                      borderRadius: 3,
                      overflow:
                        "hidden",
                    }}
                  >
                    {/* CARD HEADER */}

                    <Box
                      sx={{
                        p: 3,
                        bgcolor:
                          "action.hover",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems:
                            "center",
                        }}
                      >
                        <Avatar
                          src={
                            employee.image
                          }
                          sx={{
                            width: 72,
                            height: 72,
                            fontSize: 28,
                          }}
                        >
                          {employee.name
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </Avatar>

                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {
                              employee.name
                            }
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {
                              employee.designation
                            }
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              today
                                ?.status ??
                              "Not Marked"
                            }
                            color={
                              today
                                ?.status ===
                              "Present"
                                ? "success"
                                : today
                                      ?.status ===
                                    "Absent"
                                  ? "error"
                                  : "default"
                            }
                            sx={{
                              mt: 1,
                            }}
                          />
                        </Box>
                      </Stack>
                    </Box>

                    <CardContent>
                      {/* DETAILS */}

                      <Stack
                        spacing={1.5}
                      >
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent:
                              "space-between",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Phone
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            {
                              employee.phone
                            }
                          </Typography>
                        </Stack>

                        <Stack
                          direction="row"
                          sx={{
                            justifyContent:
                              "space-between",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Monthly Salary
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {formatPrice(
                              employee.salary
                            )}
                          </Typography>
                        </Stack>

                        <Divider />

                        {/* IN OUT */}

                        <Grid
                          container
                          spacing={1}
                        >
                          <Grid
                            size={6}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                border:
                                  "1px solid",
                                borderColor:
                                  "divider",
                                borderRadius:
                                  2,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                In Time
                              </Typography>

                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  mt: 0.5,
                                }}
                              >
                                {
                                  today?.inTime ||
                                  "--:--"
                                }
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid
                            size={6}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                border:
                                  "1px solid",
                                borderColor:
                                  "divider",
                                borderRadius:
                                  2,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Out Time
                              </Typography>

                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  mt: 0.5,
                                }}
                              >
                                {
                                  today?.outTime ||
                                  "--:--"
                                }
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* CHECK IN / OUT */}

                        <Stack
                          direction="row"
                          spacing={1}
                        >
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={
                              <CheckCircle />
                            }
                            disabled={
                              !!today
                            }
                            onClick={() =>
                              checkIn(
                                employee
                              )
                            }
                          >
                            Check In
                          </Button>

                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={
                              <Logout />
                            }
                            disabled={
                              !today ||
                              !!today.outTime
                            }
                            onClick={() =>
                              checkOut(
                                employee
                              )
                            }
                          >
                            Check Out
                          </Button>
                        </Stack>

                        {/* ACTIONS */}

                        <Stack
                          direction="row"
                          spacing={1}
                        >
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={
                              <CalendarMonth />
                            }
                            onClick={() =>
                              openAttendance(
                                employee
                              )
                            }
                          >
                            Attendance
                          </Button>

                          <IconButton
                            color="primary"
                            onClick={() =>
                              openEditEmployee(
                                employee
                              )
                            }
                          >
                            <EditOutlined />
                          </IconButton>

                          <IconButton
                            color="error"
                            onClick={() =>
                              deleteEmployee(
                                employee.id
                              )
                            }
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            }
          )}
        </Grid>
      )}

      {/* =================================================
          ADD / EDIT EMPLOYEE DIALOG
      ================================================= */}

      <Dialog
        open={employeeDialog}
        onClose={
          closeEmployeeDialog
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            {editingId !== null
              ? "Edit Employee"
              : "Add Employee"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Enter employee
            information
          </Typography>
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Stack
            spacing={2}
            sx={{
              pt: 1,
            }}
          >
            {/* IMAGE */}

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "center",
              }}
            >
              <Box
                sx={{
                  position:
                    "relative",
                }}
              >
                <Avatar
                  src={form.image}
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: 35,
                  }}
                >
                  {form.name
                    ? form.name
                        .charAt(0)
                        .toUpperCase()
                    : <Person />}
                </Avatar>

                <IconButton
                  component="label"
                  sx={{
                    position:
                      "absolute",
                    right: -5,
                    bottom: -5,
                    bgcolor:
                      "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor:
                        "primary.dark",
                    },
                  }}
                >
                  <CameraAlt />

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageUpload
                    }
                  />
                </IconButton>
              </Box>
            </Box>

            <Grid
              container
              spacing={2}
            >
              {/* NAME */}

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={
                    form.name
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "name",
                      event.target
                        .value
                    )
                  }
                />
              </Grid>

              {/* PHONE */}

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Phone"
                  value={
                    form.phone
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "phone",
                      event.target
                        .value
                    )
                  }
                />
              </Grid>

              {/* CNIC */}

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="CNIC / ID"
                  value={
                    form.cnic
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "cnic",
                      event.target
                        .value
                    )
                  }
                />
              </Grid>

              {/* DESIGNATION */}

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Designation"
                  placeholder="e.g. Salesman"
                  value={
                    form.designation
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "designation",
                      event.target
                        .value
                    )
                  }
                />
              </Grid>

              {/* SALARY */}

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Monthly Salary"
                  type="number"
                  value={
                    form.salary
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "salary",
                      event.target
                        .value
                    )
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0,
                    },
                  }}
                />
              </Grid>

              {/* JOINING DATE */}

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Joining Date"
                  type="date"
                  value={
                    form.joiningDate
                  }
                  onChange={(
                    event
                  ) =>
                    handleChange(
                      "joiningDate",
                      event.target
                        .value
                    )
                  }
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={
              closeEmployeeDialog
            }
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={
              editingId !== null ? (
                <EditOutlined />
              ) : (
                <Add />
              )
            }
            onClick={
              saveEmployee
            }
            disabled={
              createEmployeeMutation.isPending ||
              updateEmployeeMutation.isPending
            }
          >
            {editingId !== null
              ? updateEmployeeMutation.isPending
                ? "Updating..."
                : "Update Employee"
              : createEmployeeMutation.isPending
                ? "Adding..."
                : "Add Employee"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================
          ATTENDANCE DIALOG
      ================================================= */}

      <Dialog
        open={attendanceDialog}
        onClose={
          closeAttendance
        }
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          {selectedEmployee && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems:
                  "center",
              }}
            >
              <Avatar
                src={
                  selectedEmployee.image
                }
              >
                {selectedEmployee.name
                  .charAt(0)
                  .toUpperCase()}
              </Avatar>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {
                    selectedEmployee.name
                  }
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {
                    selectedEmployee.designation
                  }{" "}
                  • Monthly Attendance
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogTitle>

        <DialogContent
          dividers
        >
          {/* SALARY SUMMARY */}

          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
            }}
          >
            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border:
                    "1px solid",
                  borderColor:
                    "success.main",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Present
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color:
                        "success.main",
                    }}
                  >
                    {
                      salarySummary.present
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border:
                    "1px solid",
                  borderColor:
                    "error.main",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Absent
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color:
                        "error.main",
                    }}
                  >
                    {
                      salarySummary.absent
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border:
                    "1px solid",
                  borderColor:
                    "warning.main",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Off
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color:
                        "warning.main",
                    }}
                  >
                    {
                      salarySummary.off
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border:
                    "1px solid",
                  borderColor:
                    "primary.main",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Final Salary
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color:
                        "primary.main",
                    }}
                  >
                    {formatPrice(
                      salarySummary.finalSalary
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* DEDUCTION */}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              border:
                "1px solid",
              borderColor:
                "divider",
              borderRadius: 2,
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              sx={{
                justifyContent:
                  "space-between",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Monthly Salary
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {selectedEmployee
                  ? formatPrice(
                      selectedEmployee.salary
                    )
                  : "-"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Absent Deduction
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                  color:
                    "error.main",
                }}
              >
                {formatPrice(
                  salarySummary.deduction
                )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Payable Salary
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                  color:
                    "success.main",
                }}
              >
                {formatPrice(
                  salarySummary.finalSalary
                )}
              </Typography>
            </Stack>
          </Paper>

          {/* ATTENDANCE TABLE */}

          <TableContainer
            sx={{
              maxHeight: 500,
            }}
          >
            <Table
              stickyHeader
              sx={{
                minWidth: 850,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Date</b>
                  </TableCell>

                  <TableCell>
                    <b>Day</b>
                  </TableCell>

                  <TableCell>
                    <b>In Time</b>
                  </TableCell>

                  <TableCell>
                    <b>Out Time</b>
                  </TableCell>

                  <TableCell>
                    <b>Working Hours</b>
                  </TableCell>

                  <TableCell>
                    <b>Status</b>
                  </TableCell>

                  <TableCell align="center">
                    <b>Mark</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {monthRecords.map(
                  ({
                    date,
                    dayName,
                    record,
                  }) => (
                    <TableRow
                      key={date}
                      hover
                    >
                      <TableCell>
                        {date}
                      </TableCell>

                      <TableCell>
                        {dayName}
                      </TableCell>

                      <TableCell>
                        {record
                          ?.inTime ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        {record
                          ?.outTime ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        {record
                          ? calculateHours(
                              record.inTime,
                              record.outTime
                            )
                          : "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            record
                              ?.status ||
                            "Not Marked"
                          }
                          color={
                            record?.status ===
                            "Present"
                              ? "success"
                              : record?.status ===
                                  "Absent"
                                ? "error"
                                : record?.status ===
                                    "Off"
                                  ? "warning"
                                  : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{
                            justifyContent:
                              "center",
                          }}
                        >
                          <IconButton
                            size="small"
                            color="success"
                            title="Present"
                            onClick={() =>
                              markAttendance(
                                selectedEmployee!.id,
                                date,
                                "Present"
                              )
                            }
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="error"
                            title="Absent"
                            onClick={() =>
                              markAttendance(
                                selectedEmployee!.id,
                                date,
                                "Absent"
                              )
                            }
                          >
                            <Person fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="warning"
                            title="Off"
                            onClick={() =>
                              markAttendance(
                                selectedEmployee!.id,
                                date,
                                "Off"
                              )
                            }
                          >
                            <CalendarMonth fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={
              closeAttendance
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}