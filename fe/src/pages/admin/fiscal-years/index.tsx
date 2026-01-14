import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Column } from "react-table";
import { format } from "date-fns";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import fiscalYearService from "@/services/fiscalYearService";
import { CreateFiscalYearPayload, FiscalYear } from "@/types/fiscal-year";
import {
    CalendarDaysIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

// Form validation schema
const fiscalYearSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    startDateBS: yup.string().required("Start Date (BS) is required"),
    endDateBS: yup.string().required("End Date (BS) is required"),
    startDateAD: yup.string().required("Start Date (AD) is required"),
    endDateAD: yup.string().required("End Date (AD) is required"),
    isCurrent: yup.boolean().optional(),
    isActive: yup.boolean().optional(),
});

interface FiscalYearFormData {
    name: string;
    startDateBS: string;
    endDateBS: string;
    startDateAD: string;
    endDateAD: string;
    isCurrent?: boolean;
    isActive?: boolean;
}

const FiscalYearsPage: React.FC = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<FiscalYear | null>(
        null
    );

    const queryClient = useQueryClient();

    // Fetch fiscal years
    const { data: fiscalYears, isLoading } = useQuery(
        "fiscalYears",
        () => fiscalYearService.getAllFiscalYears(),
        {
            keepPreviousData: true,
        }
    );

    // Mutations
    const createMutation = useMutation(fiscalYearService.createFiscalYear, {
        onSuccess: () => {
            queryClient.invalidateQueries("fiscalYears");
            setShowCreateModal(false);
        },
    });

    const updateMutation = useMutation(
        ({ id, data }: { id: string; data: CreateFiscalYearPayload }) =>
            fiscalYearService.updateFiscalYear(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("fiscalYears");
                setShowEditModal(false);
                setSelectedFiscalYear(null);
            },
        }
    );

    const deleteMutation = useMutation(fiscalYearService.deleteFiscalYear, {
        onSuccess: () => {
            queryClient.invalidateQueries("fiscalYears");
        },
    });

    // Form setup
    const form = useForm<FiscalYearFormData>({
        resolver: yupResolver(fiscalYearSchema),
        defaultValues: {
            name: "",
            startDateBS: "",
            endDateBS: "",
            startDateAD: "",
            endDateAD: "",
            isCurrent: false,
            isActive: true,
        },
    });

    // Handle form submission
    const handleSubmit = (data: FiscalYearFormData) => {
        // Determine if setting this year to Active automatically unsets others. 
        // Backend handles this logic inside transaction.
        const payload: CreateFiscalYearPayload = {
            name: data.name,
            startDateBS: data.startDateBS,
            endDateBS: data.endDateBS,
            startDateAD: data.startDateAD,
            endDateAD: data.endDateAD,
            isCurrent: data.isCurrent,
            isActive: data.isActive
        };

        if (selectedFiscalYear) {
            updateMutation.mutate({
                id: selectedFiscalYear.id,
                data: payload,
            });
        } else {
            createMutation.mutate(payload);
        }
    };

    // Handle edit
    const handleEdit = (fiscalYear: FiscalYear) => {
        setSelectedFiscalYear(fiscalYear);
        form.reset({
            name: fiscalYear.name,
            startDateBS: fiscalYear.startDateBS,
            endDateBS: fiscalYear.endDateBS,
            startDateAD: new Date(fiscalYear.startDateAD).toISOString().split('T')[0],
            endDateAD: new Date(fiscalYear.endDateAD).toISOString().split('T')[0],
            isCurrent: fiscalYear.isCurrent,
            isActive: fiscalYear.isActive,
        });
        setShowEditModal(true);
    };

    // Handle delete
    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this Fiscal Year?")) {
            deleteMutation.mutate(id);
        }
    };

    // Columns
    const columns: Column<FiscalYear>[] = [
        {
            Header: "Name",
            accessor: "name",
            Cell: ({ value }: { value: string }) => (
                <span className="font-semibold text-gray-900">{value}</span>
            ),
        },
        {
            Header: "Start Date (BS)",
            accessor: "startDateBS",
        },
        {
            Header: "End Date (BS)",
            accessor: "endDateBS",
        },
        {
            Header: "Start Date (AD)",
            accessor: "startDateAD",
            Cell: ({ value }: { value: string }) => (
                <span>{format(new Date(value), "yyyy-MM-dd")}</span>
            ),
        },
        {
            Header: "End Date (AD)",
            accessor: "endDateAD",
            Cell: ({ value }: { value: string }) => (
                <span>{format(new Date(value), "yyyy-MM-dd")}</span>
            ),
        },
        {
            Header: "Current",
            accessor: "isCurrent",
            Cell: ({ value }: { value: boolean }) => (
                <Badge variant={value ? "success" : "secondary"}>
                    {value ? "Current" : "No"}
                </Badge>
            ),
        },
        {
            Header: "Active",
            accessor: "isActive",
            Cell: ({ value }: { value: boolean }) => (
                <Badge variant={value ? "primary" : "secondary"}>
                    {value ? "Yes" : "No"}
                </Badge>
            ),
        },
        {
            Header: "Actions",
            accessor: "id" as keyof FiscalYear,
            Cell: ({ row }: { row: any }) => {
                const item = row.original;
                return (
                    <div className="flex space-x-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            icon={<PencilIcon className="h-4 w-4" />}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            icon={<TrashIcon className="h-4 w-4" />}
                        >
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <ProtectedRoute adminOnly>
            <MainLayout title="Fiscal Years">
                <div className="px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Fiscal Years
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                Manage local fiscal years (Shrawan–Ashad)
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setSelectedFiscalYear(null);
                                form.reset({
                                    name: '',
                                    startDateBS: '',
                                    endDateBS: '',
                                    startDateAD: '',
                                    endDateAD: '',
                                    isCurrent: false,
                                    isActive: true
                                });
                                setShowCreateModal(true);
                            }}
                            icon={<PlusIcon className="h-4 w-4" />}
                        >
                            Add Fiscal Year
                        </Button>
                    </div>

                    <Card>
                        {isLoading ? (
                            <div className="text-center py-8">Loading fiscal years...</div>
                        ) : (
                            <Table
                                data={fiscalYears || []}
                                columns={columns}
                            />
                        )}
                    </Card>

                    {/* Create/Edit Modal */}
                    <Modal
                        isOpen={showCreateModal || showEditModal}
                        onClose={() => {
                            setShowCreateModal(false);
                            setShowEditModal(false);
                            setSelectedFiscalYear(null);
                        }}
                        title={selectedFiscalYear ? "Edit Fiscal Year" : "Create Fiscal Year"}
                    >
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div>
                                <label className="form-label">Name (e.g., 2080/81)</label>
                                <input
                                    type="text"
                                    {...form.register("name")}
                                    className={`form-input ${form.formState.errors.name ? "border-red-300" : ""
                                        }`}
                                    placeholder="2080/81"
                                />
                                {form.formState.errors.name && (
                                    <p className="form-error">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Start Date (BS)</label>
                                    <input
                                        type="text"
                                        {...form.register("startDateBS")}
                                        className={`form-input ${form.formState.errors.startDateBS ? "border-red-300" : ""
                                            }`}
                                        placeholder="YYYY-MM-DD"
                                    />
                                    {form.formState.errors.startDateBS && (
                                        <p className="form-error">
                                            {form.formState.errors.startDateBS.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">End Date (BS)</label>
                                    <input
                                        type="text"
                                        {...form.register("endDateBS")}
                                        className={`form-input ${form.formState.errors.endDateBS ? "border-red-300" : ""
                                            }`}
                                        placeholder="YYYY-MM-DD"
                                    />
                                    {form.formState.errors.endDateBS && (
                                        <p className="form-error">
                                            {form.formState.errors.endDateBS.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Start Date (AD)</label>
                                    <input
                                        type="date"
                                        {...form.register("startDateAD")}
                                        className={`form-input ${form.formState.errors.startDateAD ? "border-red-300" : ""
                                            }`}
                                    />
                                    {form.formState.errors.startDateAD && (
                                        <p className="form-error">
                                            {form.formState.errors.startDateAD.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="form-label">End Date (AD)</label>
                                    <input
                                        type="date"
                                        {...form.register("endDateAD")}
                                        className={`form-input ${form.formState.errors.endDateAD ? "border-red-300" : ""
                                            }`}
                                    />
                                    {form.formState.errors.endDateAD && (
                                        <p className="form-error">
                                            {form.formState.errors.endDateAD.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...form.register("isCurrent")}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2 text-sm">Set as Current Fiscal Year</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...form.register("isActive")}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2 text-sm">Active</span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setShowEditModal(false);
                                        setSelectedFiscalYear(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={createMutation.isLoading || updateMutation.isLoading}
                                >
                                    {selectedFiscalYear ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </MainLayout>
        </ProtectedRoute>
    );
};

export async function getServerSideProps({ locale }: { locale: string }) {
    return {
        props: {
            ...(await import('next-i18next/serverSideTranslations').then(m =>
                m.serverSideTranslations(locale, ['common', 'auth'])
            )),
        },
    };
}

export default FiscalYearsPage;
