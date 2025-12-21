import { z } from "zod";

export const bookingSchema = z.object({
  hotel_id: z.string().min(1, { message: "errorHotelRequired" }),
  room_id: z.string().min(1, { message: "errorRoomRequired" }),
  customer_name: z.string().min(2, { message: "errorNameRequired" }),
  customer_email: z.string().email({ message: "errorEmailInvalid" }),
  check_in: z.string().refine((date) => new Date(date) >= new Date(new Date().setHours(0,0,0,0)), {
    message: "errorDatePast",
  }),
  check_out: z.string(),
  guests_count: z.number().min(1, { message: "errorGuestsMin" }).max(10, { message: "errorGuestsMax" }),
}).refine((data) => {
  const start = new Date(data.check_in);
  const end = new Date(data.check_out);
  return end > start;
}, {
  message: "errorDateOrder",
  path: ["check_out"], // Hatanın görüneceği alan
});

export type BookingSchemaType = z.infer<typeof bookingSchema>;
