import Link from "next/link";
import { notFound } from "next/navigation";
import cabinetData from "@/data/cabinet.json";
import AlignmentSection from "./alignment-section";

interface CabinetMemberPageProps {
  params: Promise<{ role: string }>;
}

export function generateStaticParams() {
  return cabinetData.members.map((member) => ({
    role: member.id,
  }));
}

export default async function CabinetMemberPage({ params }: CabinetMemberPageProps) {
  const { role } = await params;
  const member = cabinetData.members.find((m) => m.id === role);

  if (!member) {
    notFound();
  }

  const formatDate = (dateStr: string) => {
    // Parse as local date to avoid timezone issues
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Photo */}
            <img 
              src={member.photo_url}
              alt={member.name}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-xl border-4 border-white"
            />
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-2">
                {member.name}
              </h1>
              <p className="text-xl md:text-2xl text-slate-700 font-semibold mb-2">
                {member.role}
              </p>
              <p className="text-lg text-slate-600">
                {member.department}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Appointment Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Appointed
              </h2>
              <p className="text-2xl font-bold text-slate-900">
                {formatDate(member.appointed_date)}
              </p>
            </div>

            {/* Confirmation Vote */}
            {member.confirmation_vote && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Confirmation Vote
                </h2>
                <p className="text-2xl font-bold text-slate-900">
                  {member.confirmation_vote}
                </p>
              </div>
            )}
          </div>

          {/* Department Info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              About {member.department}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {member.department === "Department of State" && 
                "The Department of State advises the President on foreign policy, conducts diplomatic relations, issues passports, and protects U.S. citizens abroad."}
              {member.department === "Department of Defense" && 
                "The Department of Defense provides military forces to deter war and protect national security, overseeing the Army, Navy, Air Force, Marine Corps, and Space Force."}
              {member.department === "Department of Justice" && 
                "The Department of Justice ensures public safety, enforces federal laws, defends U.S. interests, and administers the federal prison system."}
              {member.department === "Department of the Treasury" && 
                "The Department of the Treasury manages federal finances, collects taxes, produces currency, and enforces economic sanctions."}
              {member.department === "Department of Health and Human Services" && 
                "The Department of Health and Human Services protects public health, ensures food and drug safety, and administers Medicare and Medicaid."}
              {member.department === "Department of Homeland Security" && 
                "The Department of Homeland Security protects the nation from threats, secures borders, enforces immigration laws, and responds to disasters."}
              {member.department === "Environmental Protection Agency" && 
                "The EPA protects human health and the environment through regulations on air quality, water safety, and hazardous waste management."}
              {member.department === "Department of the Interior" && 
                "The Department of the Interior manages federal lands, protects natural resources, and oversees relations with Native American tribes."}
              {member.department === "Department of Agriculture" && 
                "The Department of Agriculture supports farmers, ensures food safety, manages national forests, and administers nutrition assistance programs."}
              {member.department === "Department of Commerce" && 
                "The Department of Commerce promotes economic growth, job creation, international trade, and technological innovation."}
              {member.department === "Department of Labor" && 
                "The Department of Labor protects workers' rights, enforces labor standards, and administers unemployment benefits and job training programs."}
              {member.department === "Department of Transportation" && 
                "The Department of Transportation ensures safe, efficient transportation systems including highways, railroads, aviation, and public transit."}
              {member.department === "Department of Energy" && 
                "The Department of Energy addresses energy security, nuclear safety, and scientific research related to energy and national security."}
              {member.department === "Department of Education" && 
                "The Department of Education promotes educational excellence, ensures equal access to education, and administers federal student aid."}
              {member.department === "Department of Veterans Affairs" && 
                "The Department of Veterans Affairs provides healthcare, benefits, and memorial services to military veterans and their families."}
              {member.department === "Department of Housing and Urban Development" && 
                "The Department of Housing and Urban Development promotes homeownership, supports community development, and ensures access to affordable housing."}
              {!["Department of State", "Department of Defense", "Department of Justice", 
                  "Department of the Treasury", "Department of Health and Human Services",
                  "Department of Homeland Security", "Environmental Protection Agency",
                  "Department of the Interior", "Department of Agriculture", "Department of Commerce",
                  "Department of Labor", "Department of Transportation", "Department of Energy",
                  "Department of Education", "Department of Veterans Affairs", 
                  "Department of Housing and Urban Development"].includes(member.department) && 
                "Information about this department's responsibilities."}
            </p>
          </div>

          {/* Policy Alignment Section */}
          <AlignmentSection memberId={member.id} />
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <Link 
            href="/executive/cabinet"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Cabinet
          </Link>
        </div>
      </section>
    </div>
  );
}
