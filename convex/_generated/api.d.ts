/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analysis from "../analysis.js";
import type * as analysisnode from "../analysisnode.js";
import type * as lib_aggregateSongs from "../lib/aggregateSongs.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_components from "../lib/components.js";
import type * as lib_spotifyEligibility from "../lib/spotifyEligibility.js";
import type * as songs from "../songs.js";
import type * as upload from "../upload.js";
import type * as user from "../user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analysis: typeof analysis;
  analysisnode: typeof analysisnode;
  "lib/aggregateSongs": typeof lib_aggregateSongs;
  "lib/auth": typeof lib_auth;
  "lib/components": typeof lib_components;
  "lib/spotifyEligibility": typeof lib_spotifyEligibility;
  songs: typeof songs;
  upload: typeof upload;
  user: typeof user;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  analysisWorkpool: import("@convex-dev/workpool/_generated/component.js").ComponentApi<"analysisWorkpool">;
  spotifyAddWorkpool: import("@convex-dev/workpool/_generated/component.js").ComponentApi<"spotifyAddWorkpool">;
};
