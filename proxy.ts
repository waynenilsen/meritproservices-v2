import { createId } from "@paralleldrive/cuid2";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
