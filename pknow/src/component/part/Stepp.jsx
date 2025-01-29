import React, { useState, useEffect } from "react";
import { Box, Stepper, Step, StepLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem } from "@mui/material";

function CustomStepper({
  initialSteps = ["Step 1", "Step 2", "Step 3"],
  additionalSteps = [],
  onChangeStep,
  onStepAdded,
  onStepRemoved,
  onChangePage,
  onStepCountChanged,
  onAllStepContents,
}) {

  const [steps, setSteps] = useState(() => {
    // Cek apakah ada data steps yang disimpan di sessionStorage
    const storedSteps = sessionStorage.getItem("steps");
    return storedSteps ? JSON.parse(storedSteps) : initialSteps; // Gunakan data sesi jika ada
  });
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [availableSteps, setAvailableSteps] = useState(additionalSteps);
  const [addedSteps, setAddedSteps] = useState(() => {
    const storedAddedSteps = sessionStorage.getItem("addedSteps");
    return storedAddedSteps ? JSON.parse(storedAddedSteps) : [];
  });

  const getAllStepContents = () => {
    const baseSteps = {
      0: "pengenalanAdd",
      1: "materiAdd",
      2: "forumAdd",
    };

    addedSteps.forEach((step, index) => {
      baseSteps[index + 3] = step;
    });

    return baseSteps;
  };

  // Fungsi untuk mengambil step content berdasarkan index
  const getStepContent = (stepIndex) => {
    const allSteps = getAllStepContents();
    return allSteps[stepIndex] || "Unknown stepIndex";
  };

  useEffect(() => {
    setActiveStep(onChangeStep);
    // Memperbarui sessionStorage setiap kali ada perubahan langkah
    sessionStorage.setItem("steps", JSON.stringify(steps));
    sessionStorage.setItem("addedSteps", JSON.stringify(addedSteps));
    onAllStepContents && onAllStepContents(getAllStepContents());
    // Update availableSteps untuk mencocokkan langkah yang sudah ditambahkan
    setAvailableSteps(additionalSteps.filter(step => !addedSteps.includes(step)));
    onStepCountChanged && onStepCountChanged(steps.length);

  }, [steps, addedSteps, additionalSteps, onStepCountChanged, onAllStepContents]);

  // Fungsi menambah step baru
  const handleAddStep = (stepName) => {
    setSteps([...steps, stepName]);
    setAddedSteps([...addedSteps, stepName]);
    setAvailableSteps(availableSteps.filter((step) => step !== stepName));
    onStepAdded && onStepAdded(stepName);
    setOpenDialog(false);
  };

  const handleRemoveStep = (index) => {
    const removedStep = steps[index];
    setSteps(steps.filter((_, i) => i !== index));
    setAddedSteps(addedSteps.filter((step) => step !== removedStep));
    setActiveStep(Math.max(0, activeStep - 1));
    onStepRemoved && onStepRemoved(removedStep);
  };

  const handleChangePage = (index) => {
    const content = getStepContent(index);
    onChangePage && onChangePage(content);
  };

  const handleChangeActiveStep = (index) => {
    setActiveStep(index);
    onChangeStep && onChangeStep(index);
    console.log("coba", getStepContent(index))
  };

  // const getStepContent = (stepIndex) => {
  //   if (stepIndex < 3) {
  //     switch (stepIndex) {
  //       case 0:
  //         return 'pengenalanAdd';
  //       case 1:
  //         return 'materiAdd';
  //       case 2:
  //         return 'forumAdd';
  //       default:
  //           console.log("test")
  //         return 'Unknown stepIndex';
  //     }
  //   } else {
  //     // Handle dynamic step content for additional steps
  //     const dynamicStepIndex = stepIndex - 3;
  //     return addedSteps[dynamicStepIndex] || 'Unknown added step';
  //   }
  // };

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Stepper 
      activeStep={activeStep} 
      alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index} 
          //onClick={() => handleChangeActiveStep(index)}
          >
            <StepLabel 
            //onClick={() => handleChangePage(index)}
              sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
            >
              {label}
            </StepLabel>
            {index >= initialSteps.length && (
              <Button
                size="small"
                color="error"
                onClick={() => handleRemoveStep(index)}
                sx={{ position: "absolute", marginTop: "-21px", marginLeft:"-0px" }}
              >
                <i className="fas fa-trash"></i>
              </Button>
            )}
          </Step>
          
        ))}
      </Stepper>

      {/* Tombol Tambah Section */}
      {availableSteps.length > 0 && (
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => setOpenDialog(true)}
        >
          Tambah Section
        </Button>
      )}

      {/* Dialog Pop-Up */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} >
        <DialogTitle style={{color:"#0A5EA8", fontFamily:"Poppins"}}>Tambah Section</DialogTitle>
        <DialogContent>
          <List>
            {availableSteps.map((step) => (
              <ListItem
                key={step}
                button
                onClick={() => handleAddStep(step)}
              >
                {step}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CustomStepper;
