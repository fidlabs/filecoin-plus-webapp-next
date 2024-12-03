"use client"

import {useMediaQuery} from "usehooks-ts";
import * as Dialog from "@/components/ui/dialog";
import * as Drawer from "@/components/ui/drawer";

const ResponsiveDialog = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return isDesktop ? Dialog.Dialog : Drawer.Drawer
}

const ResponsiveDialogTrigger = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return isDesktop ? Dialog.DialogTrigger : Drawer.DrawerTrigger
}

const ResponsiveDialogClose = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return isDesktop ? Dialog.DialogClose : Drawer.DrawerClose
}

const ResponsiveDialogOverlay = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return isDesktop ? Dialog.DialogOverlay : Drawer.DrawerOverlay
}

const ResponsiveDialogContent = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return isDesktop ? Dialog.DialogContent : Drawer.DrawerContent
}

const ResponsiveDialogHeader = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return isDesktop ? Dialog.DialogHeader : Drawer.DrawerHeader
}

const ResponsiveDialogFooter = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return isDesktop ? Dialog.DialogFooter : Drawer.DrawerFooter
}

const ResponsiveDialogTitle = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return isDesktop ? Dialog.DialogTitle : Drawer.DrawerTitle
}


export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogClose,
  ResponsiveDialogOverlay,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogHeader
}