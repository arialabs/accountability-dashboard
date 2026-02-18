import Link from "next/link";
import { formatDate } from "@/lib/formatting";

interface ExecutiveOrder {
  document_number: string;
  title: string;
  executive_order_number: number;
  signing_date: string;
  abstract: string;
  html_url: string;
  pdf_url: string;
}

interface FederalRegisterResponse {
  results: ExecutiveOrder[];
  count: number;
  total_pages: number;
}

async function fetchExecutiveOrders(): Promise<FederalRegisterResponse | null> {
  try {
    const response = await fetch(
      "https://www.federalregister.gov/api/v1/documents.json?conditions[presidential_document_type]=executive_order&conditions[president]=donald-trump&per_page=50",
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

export default async function ExecutiveOrdersPage() {
  const data = await fetchExecutiveOrders();

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-black text-slate-900 mb-4">Executive Orders</h1>
            <p className="text-red-600">Failed to load executive orders. Please try again later.</p>
            <Link 
              href="/executive/president"
              className="inline-block mt-6 text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to President
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { results: orders, count } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">📜</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
              Executive Orders
            </h1>
            <p className="text-lg text-slate-600 mb-2">
              Track all executive orders signed by President Trump
            </p>
            <div className="text-3xl font-black text-blue-600">
              {count} Executive Orders
            </div>
          </div>
        </div>
      </section>

      {/* Executive Orders List */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.document_number}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                        EO {order.executive_order_number}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatDate(order.signing_date, 'full')}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                      {order.title}
                    </h2>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-slate-700 mb-4 leading-relaxed">
                  {order.abstract}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={order.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm"
                  >
                    Read Full Text →
                  </a>
                  <a
                    href={order.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
                  >
                    Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {orders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Executive Orders Yet</h3>
              <p className="text-slate-600">Check back soon for updates.</p>
            </div>
          )}
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <Link 
            href="/executive/president"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to President
          </Link>
        </div>
      </section>
    </div>
  );
}
