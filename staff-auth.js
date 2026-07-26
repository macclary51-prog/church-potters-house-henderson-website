if (!staffSnapshot.exists()) {
  throw new Error(
    "No staff document found at /staff/" + user.uid
  );
}

const staff = staffSnapshot.data();

if (staff.active !== true) {
  throw new Error(
    "The active field is not the Boolean true."
  );
}

if (!["pastor", "ministry"].includes(staff.role)) {
  throw new Error(
    'The role is "' + staff.role + '" instead of pastor or ministry.'
  );
}
