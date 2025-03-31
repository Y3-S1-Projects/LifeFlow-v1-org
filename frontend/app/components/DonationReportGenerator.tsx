"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDarkMode } from "@/app/contexts/DarkModeContext";

interface Address {
  street: string;
  city: string;
  postalCode: string;
}

interface DonationCenter {
  name: string;
  address: Address | string;
  contact: string;
}

interface Donation {
  donationDate: string;
  donationCenter: DonationCenter;
  donationType: string;
  pintsDonated: number;
}

interface DonationStats {
  totalDonations: number;
  totalPints: number;
  livesImpacted: number;
  firstDonation: string | null;
  mostRecentDonation: string | null;
}

interface DonationReportProps {
  donations: Donation[];
  stats: DonationStats;
  user: any;
  nextEligibleDate: string;
}

const DonationReportGenerator: React.FC<DonationReportProps> = ({
  donations,
  stats,
  user,
  nextEligibleDate,
}) => {
  const { darkMode } = useDarkMode();

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatAddress = (address: string | Address): string => {
    if (typeof address === "string") return address;
    return `${address.street}, ${address.city}${
      address.postalCode ? `, ${address.postalCode}` : ""
    }`;
  };

  const calculateLivesImpacted = (pints: number): string => {
    const lives = Math.round(pints * 3);
    return `~${lives} ${lives === 1 ? "life" : "lives"}`;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currentY = margin;

    // Document metadata
    doc.setProperties({
      title: `Blood Donation Report - ${user?.firstName || ""} ${
        user?.lastName || ""
      }`,
      subject: "Blood Donation History",
      author: "Blood Donation Tracker",
    });

    // Header with logo and title
    doc.setFontSize(24);
    doc.setTextColor(187, 18, 18);
    doc.setFont("helvetica", "bold");
    doc.text("BLOOD DONATION REPORT", pageWidth / 2, currentY, {
      align: "center",
    });
    currentY += 15;

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Comprehensive Donation History", pageWidth / 2, currentY, {
      align: "center",
    });
    currentY += 20;

    // Donor Information Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("DONOR INFORMATION", margin, currentY);
    currentY += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Name: ${user?.firstName || "N/A"} ${user?.lastName || ""}`,
      margin,
      currentY
    );
    currentY += 8;
    doc.text(
      `Blood Type: ${user?.bloodType || "Not specified"}`,
      margin,
      currentY
    );
    currentY += 8;
    doc.text(
      `Next Eligible Donation: ${formatDate(nextEligibleDate)}`,
      margin,
      currentY
    );
    currentY += 15;

    // Statistics Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DONATION STATISTICS", margin, currentY);
    currentY += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Donations: ${stats.totalDonations}`, margin, currentY);
    currentY += 8;
    doc.text(`Total Pints Donated: ${stats.totalPints}`, margin, currentY);
    currentY += 8;
    doc.text(
      `Estimated Lives Impacted: ${stats.livesImpacted}`,
      margin,
      currentY
    );
    currentY += 8;
    doc.text(
      `First Donation: ${formatDate(stats.firstDonation)}`,
      margin,
      currentY
    );
    currentY += 8;
    doc.text(
      `Most Recent Donation: ${formatDate(stats.mostRecentDonation)}`,
      margin,
      currentY
    );
    currentY += 15;

    // Donation History Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DONATION HISTORY", margin, currentY);
    currentY += 10;

    // Prepare table data
    const tableBody = donations.map((donation) => [
      formatDate(donation.donationDate),
      donation.donationCenter.name,
      formatAddress(donation.donationCenter.address),
      donation.donationType,
      `${donation.pintsDonated} ${
        donation.pintsDonated === 1 ? "pint" : "pints"
      }`,
      calculateLivesImpacted(donation.pintsDonated),
    ]);

    // Generate table
    autoTable(doc, {
      startY: currentY,
      head: [["Date", "Center", "Address", "Type", "Amount", "Impact"]],
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: [187, 18, 18],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 25, halign: "center" },
        1: { cellWidth: 30 },
        2: { cellWidth: 45 },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 20, halign: "center" },
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: "linebreak",
      },
      margin: { left: margin, right: margin },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || currentY;
    const footerY = finalY + 15;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This report is generated for informational purposes only. For official records, please contact your donation center.",
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    // Page number and generation date
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()} | Page 1 of 1`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );

    // Save the document
    const fileName = `Blood_Donation_Report_${
      user?.firstName || "User"
    }_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={generatePDF}
            className={`${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-100"
                : "bg-white hover:bg-gray-50 text-gray-800"
            } border border-gray-300 shadow-sm text-sm flex items-center gap-2 transition-all hover:shadow-md`}
            variant="outline"
          >
            <Download className="h-4 w-4" />
            <span>Generate Full Report</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 bg-white border border-gray-200 shadow-lg">
          <p className="text-sm text-gray-700">
            Download a comprehensive PDF report of your complete donation
            history, including detailed statistics, impact metrics, and
            certification-ready documentation.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DonationReportGenerator;
