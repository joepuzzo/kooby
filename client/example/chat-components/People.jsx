import {
  Button,
  ProgressCircle,
  TableView,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Text,
} from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useKooby } from "../../components/Kooby.jsx";
import { useGet } from "../useGet.jsx";

function apiUrlFromEndpoint(endpoint) {
  if (!endpoint || typeof endpoint !== "string") {
    return null;
  }
  if (endpoint.startsWith("/api/")) {
    return endpoint;
  }
  if (endpoint.startsWith("/")) {
    return `/api${endpoint}`;
  }
  return `/api/${endpoint}`;
}

function parseChildren(children) {
  if (children == null) {
    return null;
  }
  const raw =
    typeof children === "string"
      ? children
      : React.Children.toArray(children).join("");
  try {
    return JSON.parse(String(raw).trim());
  } catch {
    return null;
  }
}

const PAGE_SIZE = 5;

const EMPTY_PEOPLE = [];

export const People = ({ children }) => {
  const parsed = useMemo(() => parseChildren(children), [children]);
  const baseUrl = parsed?.endpoint ? apiUrlFromEndpoint(parsed.endpoint) : null;

  const [page, setPage] = useState(1);

  const [loading, error, data, { get }] = useGet({
    url: "",
    lazy: true,
  });

  const { updateContext } = useKooby();

  useEffect(() => {
    if (!baseUrl) {
      return;
    }
    get({
      url: `${baseUrl}?page=${page}&limit=${PAGE_SIZE}`,
    });
  }, [baseUrl, page, get]);

  const showFullSpinner =
    (loading && data == null) || (data == null && error == null && !loading);
  const rows = data?.people ?? EMPTY_PEOPLE;
  const hasMore = Boolean(data?.hasMore);
  const total = data?.total ?? rows.length;

  const onRowAction = useCallback(
    (key) => {
      const person = rows.find((r) => String(r.id) === String(key));
      if (!person) {
        return;
      }
      // updateContext({
      //   info: `Current person selection: ${person.name} (${person.title})`,
      //   prompt: `Display information about ${person.name} with id ${person.id}`,
      // });

      // Navigate by setting the hash - this triggers Kram's handleHashChange
      window.location.hash = `#about/people/${person.id}`;
    },
    [rows, updateContext],
  );

  if (!parsed?.endpoint || !baseUrl) {
    return null;
  }

  return (
    <div
      className={style({
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "full",
        maxWidth: "full",
        minWidth: 0,
      })}
    >
      {showFullSpinner && (
        <div
          className={style({
            display: "flex",
            alignItems: "center",
            gap: 8,
          })}
        >
          <ProgressCircle
            size="S"
            aria-label="Loading people"
            isIndeterminate
          />
          <Text>Loading people…</Text>
        </div>
      )}
      {error && <Text>Could not load people: {error.message}</Text>}
      {!showFullSpinner && !error && (
        <>
          <TableView
            aria-label="People"
            overflowMode="wrap"
            onAction={onRowAction}
            styles={style({ width: "full", minHeight: 120 })}
          >
            <TableHeader>
              <Column id="name" isRowHeader>
                Name
              </Column>
              <Column id="title">Title</Column>
              <Column id="email">Email</Column>
            </TableHeader>
            <TableBody items={rows}>
              {(item) => (
                <Row id={item.id}>
                  <Cell>{item.name}</Cell>
                  <Cell>{item.title}</Cell>
                  <Cell>{item.email}</Cell>
                </Row>
              )}
            </TableBody>
          </TableView>
          <div
            className={style({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            })}
          >
            <Text>
              Page {data?.page ?? page} — showing {rows.length} of {total}{" "}
              people
              {hasMore ? " (more on next page)" : ""}
            </Text>
            <div
              className={style({
                display: "flex",
                gap: 8,
              })}
            >
              <Button
                variant="secondary"
                isDisabled={page <= 1 || loading}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                isDisabled={!hasMore || loading}
                onPress={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
