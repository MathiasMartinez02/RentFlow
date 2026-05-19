import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name too long"),
  type: z.enum(["apartment", "house", "commercial", "studio"], {
    required_error: "Property type is required",
  }),
  status: z.enum(["available", "occupied", "maintenance", "reserved"]).default("available"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  bedrooms: z.coerce.number().int().min(0, "Must be 0 or more"),
  bathrooms: z.coerce.number().int().min(1, "At least 1 bathroom required"),
  area: z.coerce.number().positive("Area must be greater than 0"),
  rent: z.coerce.number().positive("Rent must be greater than 0"),
  deposit: z.coerce.number().min(0, "Deposit cannot be negative"),
  yearBuilt: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional().or(z.literal("")),
  parking: z.boolean().default(false),
  petFriendly: z.boolean().default(false),
  furnished: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  description: z.string().max(1000, "Description too long").optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

export const DEFAULT_PROPERTY_VALUES: PropertyFormValues = {
  name: "",
  type: "apartment",
  status: "available",
  address: "",
  city: "",
  state: "",
  bedrooms: 1,
  bathrooms: 1,
  area: 0,
  rent: 0,
  deposit: 0,
  yearBuilt: undefined,
  parking: false,
  petFriendly: false,
  furnished: false,
  amenities: [],
  description: "",
};
