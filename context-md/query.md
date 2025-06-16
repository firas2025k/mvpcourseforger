  React.useEffect(() => {
    toast.success("Course created successfully!", { icon: <CheckCircle className="h-4 w-4 text-white" /> });
    setTimeout(() => toast.error("Error creating course.", { icon: <XCircle className="h-4 w-4 text-white" /> }), 1000);
    setTimeout(() => toast.info("New update available.", { icon: <Info className="h-4 w-4 text-gray-800" /> }), 2000);
    setTimeout(() => toast.warning("Low course limit!", {
      icon: <AlertTriangle className="h-4 w-4 text-yellow-800" />,
      action: {
        label: "Upgrade Now",
        onClick: () => window.location.href = "/pricing",
      },
    }), 3000);
  }, []);
