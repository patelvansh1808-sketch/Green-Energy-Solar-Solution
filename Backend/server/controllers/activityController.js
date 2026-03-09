const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const MaintenancePlan = require("../models/MaintenancePlan");
const MaintenanceService = require("../models/MaintenanceService");
const SubsidyApplication = require("../models/SubsidyApplication");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pushEvent = (events, payload) => {
  const date = normalizeDate(payload.date);
  if (!date) return;

  events.push({
    id: payload.id,
    module: payload.module,
    title: payload.title,
    description: payload.description,
    status: payload.status || "",
    date: date.toISOString(),
    raw: payload.raw || null,
  });
};

exports.getMyHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { module, from, to, page = "1", limit = "25" } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const [user, customer, bookings, plans, services] = await Promise.all([
      User.findById(userId).select("email firstName lastName name"),
      Customer.findOne({ userId }).select("_id"),
      Booking.find({ user: userId })
        .select("_id systemType capacity status createdAt updatedAt bookingDate payment")
        .sort({ createdAt: -1 })
        .limit(200),
      MaintenancePlan.find({ userId })
        .select("_id planType status startDate endDate createdAt updatedAt")
        .sort({ createdAt: -1 })
        .limit(100),
      MaintenanceService.find({ userId })
        .select("_id type status date createdAt updatedAt")
        .sort({ createdAt: -1 })
        .limit(200),
    ]);

    let tickets = [];
    let subsidyApplication = null;

    const ticketOrFilters = [];
    if (customer?._id) {
      ticketOrFilters.push({ customerId: customer._id });
    }
    if (user?.email) {
      ticketOrFilters.push({ customerEmail: user.email });
    }

    if (ticketOrFilters.length > 0) {
      tickets = await Ticket.find({ $or: ticketOrFilters })
        .select("_id subject category status createdAt updatedAt ticketNumber")
        .sort({ createdAt: -1 })
        .limit(200);
    }

    if (customer?._id) {
      subsidyApplication = await SubsidyApplication.findOne({ customerId: customer._id })
        .select("_id status appliedAmount approvedAmount appliedDate reviewedDate approvalDate createdAt updatedAt")
        .sort({ createdAt: -1 });
    }

    const events = [];

    bookings.forEach((booking) => {
      pushEvent(events, {
        id: `booking-created-${booking._id}`,
        module: "booking",
        title: "Booking Created",
        description: `${booking.systemType || "Solar"}${booking.capacity ? ` (${booking.capacity} kW)` : ""}`,
        status: booking.status || "Pending",
        date: booking.createdAt || booking.bookingDate,
        raw: booking,
      });

      if (booking.updatedAt && String(booking.updatedAt) !== String(booking.createdAt)) {
        pushEvent(events, {
          id: `booking-updated-${booking._id}`,
          module: "booking",
          title: "Booking Updated",
          description: `Booking status: ${booking.status || "Updated"}`,
          status: booking.status || "Updated",
          date: booking.updatedAt,
          raw: booking,
        });
      }

      if (booking.payment?.advancePaidDate) {
        pushEvent(events, {
          id: `booking-advance-paid-${booking._id}`,
          module: "booking",
          title: "Booking Payment Completed",
          description: "Advance payment completed",
          status: "Paid",
          date: booking.payment.advancePaidDate,
          raw: booking,
        });
      }

      if (booking.payment?.finalPaidDate) {
        pushEvent(events, {
          id: `booking-final-paid-${booking._id}`,
          module: "booking",
          title: "Final Payment Completed",
          description: "Final booking payment completed",
          status: "Paid",
          date: booking.payment.finalPaidDate,
          raw: booking,
        });
      }
    });

    plans.forEach((plan) => {
      pushEvent(events, {
        id: `plan-${plan._id}`,
        module: "subscription",
        title: "Maintenance Subscription",
        description: `${plan.planType || "Plan"} subscription ${String(plan.status || "").toLowerCase()}`,
        status: plan.status || "Active",
        date: plan.startDate || plan.createdAt,
        raw: plan,
      });
    });

    services.forEach((service) => {
      pushEvent(events, {
        id: `service-${service._id}`,
        module: "maintenance",
        title: "Maintenance Service Activity",
        description: `${service.type || "Service"} - ${service.status || "Scheduled"}`,
        status: service.status || "Scheduled",
        date: service.date || service.createdAt,
        raw: service,
      });
    });

    tickets.forEach((ticket) => {
      pushEvent(events, {
        id: `ticket-${ticket._id}`,
        module: "ticket",
        title: "Support Ticket",
        description: `${ticket.subject || "Support request"} (${ticket.category || "general"})`,
        status: ticket.status || "open",
        date: ticket.createdAt,
        raw: ticket,
      });

      if (ticket.updatedAt && String(ticket.updatedAt) !== String(ticket.createdAt)) {
        pushEvent(events, {
          id: `ticket-updated-${ticket._id}`,
          module: "ticket",
          title: "Ticket Updated",
          description: `Ticket status: ${ticket.status || "updated"}`,
          status: ticket.status || "updated",
          date: ticket.updatedAt,
          raw: ticket,
        });
      }
    });

    if (subsidyApplication) {
      pushEvent(events, {
        id: `subsidy-applied-${subsidyApplication._id}`,
        module: "subsidy",
        title: "Subsidy Application Submitted",
        description: `Applied amount: Rs. ${Number(subsidyApplication.appliedAmount || 0).toLocaleString("en-IN")}`,
        status: subsidyApplication.status || "Applied",
        date: subsidyApplication.appliedDate || subsidyApplication.createdAt,
        raw: subsidyApplication,
      });

      if (subsidyApplication.reviewedDate) {
        pushEvent(events, {
          id: `subsidy-reviewed-${subsidyApplication._id}`,
          module: "subsidy",
          title: "Subsidy Under Review",
          description: "Subsidy application moved to review stage",
          status: "Under Review",
          date: subsidyApplication.reviewedDate,
          raw: subsidyApplication,
        });
      }

      if (subsidyApplication.approvalDate) {
        pushEvent(events, {
          id: `subsidy-approved-${subsidyApplication._id}`,
          module: "subsidy",
          title: "Subsidy Status Updated",
          description: `Current subsidy status: ${subsidyApplication.status}`,
          status: subsidyApplication.status || "Updated",
          date: subsidyApplication.approvalDate,
          raw: subsidyApplication,
        });
      }
    }

    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    let filteredEvents = events;

    if (module && module !== "all") {
      filteredEvents = filteredEvents.filter((event) => event.module === module);
    }

    const fromDate = normalizeDate(from);
    if (fromDate) {
      filteredEvents = filteredEvents.filter((event) => new Date(event.date) >= fromDate);
    }

    const toDate = normalizeDate(to);
    if (toDate) {
      const inclusiveTo = new Date(toDate);
      inclusiveTo.setHours(23, 59, 59, 999);
      filteredEvents = filteredEvents.filter((event) => new Date(event.date) <= inclusiveTo);
    }

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const totalItems = filteredEvents.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / parsedLimit));
    const safePage = Math.min(parsedPage, totalPages);
    const startIndex = (safePage - 1) * parsedLimit;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + parsedLimit);

    const summary = {
      total: filteredEvents.length,
      booking: filteredEvents.filter((event) => event.module === "booking").length,
      subscription: filteredEvents.filter((event) => event.module === "subscription").length,
      maintenance: filteredEvents.filter((event) => event.module === "maintenance").length,
      ticket: filteredEvents.filter((event) => event.module === "ticket").length,
      subsidy: filteredEvents.filter((event) => event.module === "subsidy").length,
    };

    return res.status(200).json({
      events: paginatedEvents,
      summary,
      pagination: {
        page: safePage,
        limit: parsedLimit,
        totalItems,
        totalPages,
      },
      filters: {
        module: module || "all",
        from: from || "",
        to: to || "",
      },
    });
  } catch (error) {
    console.error("GET MY HISTORY ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch user activity history",
      error: error.message,
    });
  }
};
