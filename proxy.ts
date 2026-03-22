import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createId } from "@paralleldrive/cuid2";

export function proxy(request: NextRequest) {
	const requestId = createId();

	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-request-id", requestId);

	const response = NextResponse.next({
		request: { headers: requestHeaders },
	});

	response.headers.set("x-request-id", requestId);

	return response;
}
