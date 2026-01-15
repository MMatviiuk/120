declare module "swagger-ui-react" {
  import * as React from "react";
  type SwaggerUIProps = Record<string, unknown>;
  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}

declare module "swagger-ui-react/swagger-ui.css" {
  const content: string;
  export default content;
}
