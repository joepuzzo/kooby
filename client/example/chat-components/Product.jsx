import React, { memo } from "react";
import {
  ProductCard,
  CardPreview,
  Image,
  Content,
  Text,
  Footer,
  Button,
} from "@react-spectrum/s2";
// import logo from 'url:./assets/logo.svg';

export const Product = memo(function Product({ children }) {
  if (!children) {
    return null;
  }

  // console.log("children", children);

  const parsed = JSON.parse(children);
  const title = parsed.title ?? parsed.label;
  const { description, preview, thumbnail } = parsed;
  return (
    <ProductCard>
      <CardPreview>
        <Image slot="preview" src={preview} />
      </CardPreview>
      <Image slot="thumbnail" src={thumbnail} />
      <Content>
        <Text slot="title">{title}</Text>
        <Text slot="description">{description}</Text>
      </Content>
      <Footer>
        <Button variant="primary">Buy now</Button>
      </Footer>
    </ProductCard>
  );
});
