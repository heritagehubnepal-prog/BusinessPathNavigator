export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message) || /^403: .*/.test(error.message);
}

export function handleUnauthorizedError(error: Error, toast: any) {
  if (isUnauthorizedError(error)) {
    toast({
      title: "Session Expired",
      description: "Please log in again to continue.",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/auth";
    }, 1000);
    return true;
  }
  return false;
}