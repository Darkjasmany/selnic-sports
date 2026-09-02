import { describe, expect, it } from "vitest";
import {
  euclideanDistance,
  isSamePerson,
  matchPercentage,
  normalizeDescriptor,
} from "@/features/biometric/utils/faceUtils";

describe("euclideanDistance", () => {
  it("devuelve 0 cuando los descriptores son idénticos", () => {
    expect(euclideanDistance([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it("calcula la distancia euclidiana correctamente", () => {
    // (1-2)^2 + (0-0)^2 + (0-0)^2 = 1 → sqrt(1) = 1
    expect(euclideanDistance([1, 0, 0], [2, 0, 0])).toBe(1);
    expect(euclideanDistance([0, 0], [3, 4])).toBe(5);
  });

  it("lanza error cuando los descriptores tienen distinto tamaño", () => {
    expect(() => euclideanDistance([1, 2], [1])).toThrow();
  });
});

describe("normalizeDescriptor", () => {
  it("devuelve tal cual un array de números", () => {
    expect(normalizeDescriptor([0.1, 0.2])).toEqual([0.1, 0.2]);
  });

  it("convierte un objeto {0: x, 1: y} a array", () => {
    expect(normalizeDescriptor({ 0: 1.5, 1: 2.5 })).toEqual([1.5, 2.5]);
  });

  it("lanza error si el dato no es array ni objeto", () => {
    expect(() => normalizeDescriptor("nope" as any)).toThrow();
    expect(() => normalizeDescriptor(null as any)).toThrow();
  });
});

describe("matchPercentage", () => {
  it("devuelve 100% para distancia 0", () => {
    expect(matchPercentage(0)).toBe(100);
  });

  it("devuelve 0% para distancia >= 1", () => {
    expect(matchPercentage(1)).toBe(0);
    expect(matchPercentage(2)).toBe(0);
  });

  it("calcula (1 - distancia) * 100 redondeado", () => {
    expect(matchPercentage(0.5)).toBe(50);
    expect(matchPercentage(0.7)).toBe(30);
  });
});

describe("isSamePerson", () => {
  it("considera misma persona si la distancia es menor al umbral", () => {
    expect(isSamePerson(0.4)).toBe(true);
    expect(isSamePerson(0.55)).toBe(false); // igual al umbral → no
    expect(isSamePerson(0.9)).toBe(false);
  });

  it("acepta un umbral personalizado", () => {
    expect(isSamePerson(0.6, 0.7)).toBe(true);
  });
});
