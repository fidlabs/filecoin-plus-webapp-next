import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedElements = {
  "RetrievabilityScoreSP": "/compliance-data-portal/storage-providers/retrievability",
  "NumberOfDealsSP": "/compliance-data-portal/storage-providers/number-of-deals",
  "BiggestDealsSP": "/compliance-data-portal/storage-providers/biggest-deals",
  "IpniMisreporting": "/compliance-data-portal/storage-providers/ipni-misreporting",
  "ComplianceSP": "/compliance-data-portal/storage-providers/compliance",
  "ClientDiversitySP": "/compliance-data-portal/storage-providers/client-diversity",
  "RetrievabilityScoreAllocator": "/compliance-data-portal/allocators/retrievability",
  "BiggestDealsAllocator": "/compliance-data-portal/allocators/biggest-deals",
  "ProviderComplianceAllocator": "/compliance-data-portal/allocators/providers-compliance",
  "AuditStateAllocator": "/compliance-data-portal/allocators/audit-state",
  "AuditOutcomesAllocator": "/compliance-data-portal/allocators/audit-outcomes",
  "AuditTimelineAllocator": "/compliance-data-portal/allocators/audit-timeline",
  "ClientDiversityAllocator": "/compliance-data-portal/allocators/client-diversity",
};

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  let redirectUrl = "/compliance-data-portal/storage-providers/compliance";

  const chart = request.nextUrl.searchParams.get('chart');
  if (chart && allowedElements.hasOwnProperty(chart)) {
    redirectUrl = allowedElements[chart as keyof typeof allowedElements];
  }
  return NextResponse.redirect(new URL(redirectUrl, request.url))
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/compliance-data-portal',
}