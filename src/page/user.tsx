import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster } from "@/components/ui/sonner";

import { useNavigate } from "react-router";

import { userSchema } from "@/zod";
import { z } from "zod";

import { toast } from "sonner";

// Define the User interface for type safety
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

// Infer the type of the form data from the schema
type UserFormData = z.infer<typeof userSchema>;

const User = () => {
  // State variables for managing users, pagination, dialog, and search
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // React Router's navigation hook
  const router = useNavigate();

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  // Redirect to dashboard if the user is not authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You must be logged in to access this page.");
      router("/");
    }
  }, [router]);

  // Fetch users from the API whenever the page changes
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `https://reqres.in/api/users?page=${page}`
        );
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, [page]);

  // Filter users based on the search query
  useEffect(() => {
    const filtered = users.filter((user) =>
      `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Handle pagination: move to the next page
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Handle pagination: move to the previous page
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Handle user deletion
  const handleDeleteUser = (userId: number) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found in localStorage");
      toast.error("Authentication token is missing.");
      return;
    }

    axios
      .delete(`https://reqres.in/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        toast.success("User deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user.");
      });
  };

  // Open the edit dialog and populate it with the selected user's data
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    reset({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
    setIsDialogOpen(true);
  };

  // Save changes to the user after editing
  const handleSaveChanges = async (data: UserFormData) => {
    if (selectedUser) {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found in localStorage");
        toast.error("Authentication token is missing.");
        return;
      }

      try {
        const response = await axios.put(
          `https://reqres.in/api/users/${selectedUser.id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedUser = { ...selectedUser, ...response.data };
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? updatedUser : user
          )
        );
        setIsDialogOpen(false);
        toast.success("User updated successfully.");
      } catch (error) {
        console.error("Error updating user:", error);
        toast.error("Failed to update user.");
      }
    }
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    toast.success("Logged out successfully.");
    router("/");
  };

  return (
    <div className="p-6 family-primary">
      {/* Toast notifications */}
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <h1 className="text-2xl font-bold mb-4">Users</h1>

        {/* Logout button */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="ml-auto"
          >
            Logout
          </Button>
        </div>

        {/* Page description */}
        <p className="mb-4 text-gray-600">
          This page displays a list of users fetched from an API. You can
          navigate through pages using the "Previous" and "Next" buttons, and
          delete users using the dropdown menu on each card.
        </p>

        {/* Search input */}
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        {/* Divider */}
        <hr className="my-6 border-t border-gray-300" />

        {/* User cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="shadow-md relative">
              <CardHeader>
                {/* Dropdown menu for edit/delete */}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">⋮</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditUser(user)}
                        className="text-blue-500 family-primary cursor-pointer"
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 family-primary cursor-pointer"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* User avatar */}
                <img
                  src={user.avatar}
                  alt={user.first_name}
                  className="w-16 h-16 rounded-full mx-auto"
                />

                {/* User name */}
                <CardTitle className="text-center mt-2">
                  {user.first_name} {user.last_name}
                </CardTitle>

                {/* User email */}
                <CardDescription className="text-center">
                  {user.email}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-6">
          <Button onClick={handlePreviousPage} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button onClick={handleNextPage} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      </div>

      {/* Edit user dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(handleSaveChanges)}
            className="space-y-4"
          >
            {/* First name input */}
            <div>
              <Input
                {...register("first_name")}
                placeholder="First Name"
                className={errors.first_name ? "border-red-500" : ""}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            {/* Last name input */}
            <div>
              <Input
                {...register("last_name")}
                placeholder="Last Name"
                className={errors.last_name ? "border-red-500" : ""}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            {/* Email input */}
            <div>
              <Input
                {...register("email")}
                placeholder="Email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Dialog footer with cancel and save buttons */}
            <DialogFooter>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="ghost"
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <div className="mt-8 text-xs text-center border-t pt-4 text-gray-500">
        Made by Adarsh Tiwari for{" "}
        <span className="text-black">Global Groupware Solutions</span> Limited
        as an Internshala Assignment
      </div>
    </div>
  );
};

export default User;
