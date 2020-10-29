import React from "react";
import { Box, Link, Flex, Button } from "@chakra-ui/core";
import NextLink from "next/link";
import { useCurrentQuery, useLogoutMutation } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useCurrentQuery();
  const [{ fetching: logout_fetching }, logout] = useLogoutMutation();
  let body = null;

  // data is loading
  if (fetching) {
    // user not logged in
  } else if (!data?.currentUser) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
      </>
    );
    // user is logged in
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.currentUser.username}</Box>
        <Button
          variant="link"
          onClick={() => {
            logout();
          }}
          isLoading={logout_fetching}
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tomato" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
