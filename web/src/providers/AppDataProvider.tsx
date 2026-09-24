"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ENQUIRIES, SHIPMENTS, delay, generateTrackingNumber } from "@/constant/mockData";
import { STATUS_AUTO_MESSAGE } from "@/lib/shipmentStatus";
import type {
  CreateShipmentInput,
  EditShipmentInput,
  Enquiry,
  EnquiryInput,
  EnquiryStatus,
  Shipment,
  ShipmentStatus,
  TrackingEvent,
} from "@/types";

interface CreateShipmentResult {
  success: boolean;
  error?: string;
  shipment?: Shipment;
}

interface AppDataContextValue {
  shipments: Shipment[];
  enquiries: Enquiry[];
  lookupShipment: (trackingNumber: string) => Promise<Shipment | null>;
  submitEnquiry: (input: EnquiryInput) => Promise<{ id: string }>;
  createShipment: (input: CreateShipmentInput) => Promise<CreateShipmentResult>;
  updateShipment: (trackingNumber: string, patch: EditShipmentInput) => Promise<void>;
  changeStatus: (trackingNumber: string, status: ShipmentStatus) => Promise<void>;
  addTrackingEvent: (trackingNumber: string, event: Omit<TrackingEvent, "id">) => Promise<void>;
  addInternalNote: (trackingNumber: string, message: string, author: string) => Promise<void>;
  setEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);


export function AppDataProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(SHIPMENTS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(ENQUIRIES);

  const lookupShipment = useCallback(
    async (trackingNumber: string) => {
      await delay();
      const normalized = trackingNumber.trim().toUpperCase();
      return shipments.find((s) => s.trackingNumber === normalized) ?? null;
    },
    [shipments],
  );

  const submitEnquiry = useCallback(async (input: EnquiryInput) => {
    await delay();
    const id = `enq-${Date.now()}`;
    const enquiry: Enquiry = { ...input, id, status: "OPEN", createdAt: new Date().toISOString() };
    setEnquiries((prev) => [enquiry, ...prev]);
    return { id };
  }, []);

  const createShipment = useCallback(
    async (input: CreateShipmentInput): Promise<CreateShipmentResult> => {
      await delay();
      const trackingNumber = (input.trackingNumber?.trim() || generateTrackingNumber()).toUpperCase();

      if (shipments.some((s) => s.trackingNumber === trackingNumber)) {
        return { success: false, error: `Tracking number ${trackingNumber} already exists.` };
      }

      const now = new Date().toISOString();
      const shipment: Shipment = {
        trackingNumber,
        status: "CREATED",
        originCity: input.originCity,
        originRegion: input.originRegion,
        destinationCity: input.destinationCity,
        destinationRegion: input.destinationRegion,
        currentLocation: input.currentLocation,
        estimatedDeliveryAt: input.estimatedDeliveryAt,
        serviceLevel: input.serviceLevel,
        packageCount: input.packageCount,
        referenceCode: input.referenceCode,
        weightKg: input.weightKg,
        sender: input.sender,
        receiver: input.receiver,
        internalNotes: [],
        createdAt: now,
        updatedAt: now,
        events: [
          {
            id: `${trackingNumber}-e1`,
            occurredAt: now,
            location: `${input.originCity}, ${input.originRegion}`,
            message: "Shipment record created.",
            status: "CREATED",
          },
        ],
      };

      setShipments((prev) => [shipment, ...prev]);
      return { success: true, shipment };
    },
    [shipments],
  );

  const updateShipment = useCallback(async (trackingNumber: string, patch: EditShipmentInput) => {
    await delay();
    setShipments((prev) =>
      prev.map((s) =>
        s.trackingNumber === trackingNumber ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s,
      ),
    );
  }, []);

  const addTrackingEvent = useCallback(async (trackingNumber: string, event: Omit<TrackingEvent, "id">) => {
    await delay();
    setShipments((prev) =>
      prev.map((s) => {
        if (s.trackingNumber !== trackingNumber) return s;
        const newEvent: TrackingEvent = { ...event, id: `${trackingNumber}-e${s.events.length + 1}-${Date.now()}` };
        return {
          ...s,
          events: [...s.events, newEvent],
          status: event.status ?? s.status,
          currentLocation: event.location,
          updatedAt: newEvent.occurredAt,
        };
      }),
    );
  }, []);

  // A quick status change is just an auto-written tracking event — this keeps the
  // badge and the timeline from ever disagreeing, whichever action staff use.
  const changeStatus = useCallback(
    async (trackingNumber: string, status: ShipmentStatus) => {
      const shipment = shipments.find((s) => s.trackingNumber === trackingNumber);
      await addTrackingEvent(trackingNumber, {
        status,
        location: shipment?.currentLocation ?? "",
        occurredAt: new Date().toISOString(),
        message: STATUS_AUTO_MESSAGE[status],
      });
    },
    [shipments, addTrackingEvent],
  );

  const addInternalNote = useCallback(async (trackingNumber: string, message: string, author: string) => {
    await delay(400);
    setShipments((prev) =>
      prev.map((s) => {
        if (s.trackingNumber !== trackingNumber) return s;
        const note = {
          id: `${trackingNumber}-n${s.internalNotes.length + 1}-${Date.now()}`,
          message,
          author,
          createdAt: new Date().toISOString(),
        };
        return { ...s, internalNotes: [...s.internalNotes, note] };
      }),
    );
  }, []);

  const setEnquiryStatus = useCallback(async (id: string, status: EnquiryStatus) => {
    await delay(400);
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      shipments,
      enquiries,
      lookupShipment,
      submitEnquiry,
      createShipment,
      updateShipment,
      changeStatus,
      addTrackingEvent,
      addInternalNote,
      setEnquiryStatus,
    }),
    [
      shipments,
      enquiries,
      lookupShipment,
      submitEnquiry,
      createShipment,
      updateShipment,
      changeStatus,
      addTrackingEvent,
      addInternalNote,
      setEnquiryStatus,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an AppDataProvider");
  return ctx;
}
