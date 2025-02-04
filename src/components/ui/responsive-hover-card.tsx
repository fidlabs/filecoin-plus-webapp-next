"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {useMediaQuery} from "usehooks-ts";

interface BaseProps {
  children: React.ReactNode
}

interface RootResponsiveHoverCardProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface ResponsiveHoverCardProps extends BaseProps {
  className?: string
  asChild?: true
}

const ResponsiveHoverCardContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
});

const useResponsiveHoverCardContext = () => {
  const context = React.useContext(ResponsiveHoverCardContext);
  if (!context) {
    throw new Error(
      "ResponsiveHoverCard components cannot be rendered outside the ResponsiveHoverCard Context",
    );
  }
  return context;
};

const ResponsiveHoverCard = ({ children, ...props }: RootResponsiveHoverCardProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const ResponsiveHoverCard = isDesktop ? HoverCard : Drawer;

  return (
    <ResponsiveHoverCardContext.Provider value={{ isDesktop }}>
      <ResponsiveHoverCard {...props} {...(!isDesktop && { autoFocus: true })}>
        {children}
      </ResponsiveHoverCard>
    </ResponsiveHoverCardContext.Provider>
  );
};


const ResponsiveHoverCardTrigger = ({ className, children, ...props }: ResponsiveHoverCardProps) => {
  const { isDesktop } = useResponsiveHoverCardContext();
  const ResponsiveHoverCardTrigger = isDesktop ? HoverCardTrigger : DrawerTrigger;

  return (
    <ResponsiveHoverCardTrigger className={className} {...props}>
      {children}
    </ResponsiveHoverCardTrigger>
  );
};

const ResponsiveHoverCardClose = ({ className, children, ...props }: ResponsiveHoverCardProps) => {
  const { isDesktop } = useResponsiveHoverCardContext();

  if (!isDesktop) {
    return null;
  }

  return (
    <DrawerClose className={className} {...props}>
      {children}
    </DrawerClose>
  );
};

const ResponsiveHoverCardContent = ({ className, children, ...props }: ResponsiveHoverCardProps) => {
  const { isDesktop } = useResponsiveHoverCardContext();
  const ResponsiveHoverCardContent = isDesktop ? HoverCardContent : DrawerContent;

  return (
    <ResponsiveHoverCardContent className={className} {...props}>
      {children}
    </ResponsiveHoverCardContent>
  );
};

const ResponsiveHoverCardDescription = ({
                               className,
                               children,
                               ...props
                             }: ResponsiveHoverCardProps) => {
  const { isDesktop } = useResponsiveHoverCardContext();

  if (!isDesktop) {
    return null;
  }

  return (
    <DrawerDescription className={className} {...props}>
      {children}
    </DrawerDescription>
  );
};

const ResponsiveHoverCardHeader = ({ className, children, ...props }: ResponsiveHoverCardProps) => {
  const { isDesktop } = useResponsiveHoverCardContext();

  if (!isDesktop) {
    return null;
  }

  return (
    <ResponsiveHoverCardHeader className={className} {...props}>
      {children}
    </ResponsiveHoverCardHeader>
  );
};

const ResponsiveHoverCardTitle = ({ className, children, ...props }: ResponsiveHoverCardProps) => {
  const { isDesktop } = useResponsiveHoverCardContext();

  if (!isDesktop) {
    return null;
  }

  return (
    <DrawerTitle className={className} {...props}>
      {children}
    </DrawerTitle>
  );
};

const ResponsiveHoverCardBody = ({ className, children, ...props }: ResponsiveHoverCardProps) => {
  return (
    <div className={cn("px-4 md:px-0", className)} {...props}>
      {children}
    </div>
  );
};

const ResponsiveHoverCardFooter = ({ className, children, ...props }: ResponsiveHoverCardProps) => {
  const { isDesktop } = useResponsiveHoverCardContext();

  if (!isDesktop) {
    return null;
  }

  return (
    <DrawerFooter className={className} {...props}>
      {children}
    </DrawerFooter>
  );
};

export {
  ResponsiveHoverCard,
  ResponsiveHoverCardTrigger,
  ResponsiveHoverCardClose,
  ResponsiveHoverCardContent,
  ResponsiveHoverCardDescription,
  ResponsiveHoverCardHeader,
  ResponsiveHoverCardTitle,
  ResponsiveHoverCardBody,
  ResponsiveHoverCardFooter,
}
