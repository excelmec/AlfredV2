import { useCallback, useContext, useState } from 'react';
import { ApiContext } from '../Contexts/Api/ApiContext';
import { getErrMsg } from './errorParser';

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  picture: string | null;
  qrCodeUrl: string | null;
  institutionId: number | null;
  gender: string | null;
  mobileNumber: string | null;
  categoryId: number;
  category: string;

  /**
   * Will be mapped from institutionId with extra apiCall
   */
  institution: string | null;
  // ambassador: null;
  // referrerAmbassadorId: null;
  // referrer: null;
  // isPaid: false;
}

export function useUserList() {
  const [userList, setUserList] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const { axiosAccPrivate } = useContext(ApiContext);

  const fetchUserList = useCallback(
    async function () {
      try {
        setLoading(true);
        setError('');
        const response = await axiosAccPrivate.get<{
          data: IUser[];
          pagination: {
            totalCount: number;
            pageSize: number;
            currentPage: number;
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
          };
        }>('/api/admin/users?PageNumber=1&PageSize=1000000');

        const collegeInstitutions = await axiosAccPrivate.get<
          {
            id: number;
            name: string;
          }[]
        >('/api/Institution/college/list');
        const shcoolInstitutions = await axiosAccPrivate.get<
          {
            id: number;
            name: string;
          }[]
        >('/api/Institution/school/list');

        const institutionMap = new Map<number, string>();
        collegeInstitutions.data.forEach((institution) => {
          institutionMap.set(institution.id, institution.name);
        });
        shcoolInstitutions.data.forEach((institution) => {
          institutionMap.set(institution.id, institution.name);
        });

        response.data.data.forEach((user) => {
          if (user.institutionId) {
            user.institution = institutionMap.get(user.institutionId) ?? null;
          }
        });

        console.log(response.data.data);
        setUserList(response.data?.data);
      } catch (error) {
        setError(getErrMsg(error));
      } finally {
        setLoading(false);
      }
    },
    [axiosAccPrivate],
  );

  const updateUserRole = async (id: number, newRole: string) => {
    try {
      await axiosAccPrivate.put('/api/Admin/users/permission', {
        id: id,
        role: newRole,
      });

      setUserList((prevList) =>
        prevList.map((user) => (user.id === id ? { ...user, role: newRole } : user)),
      );
    } catch (error) {
      throw new Error('Failed to update user role');
    }
  };

  return { userList, loading, error, fetchUserList, updateUserRole } as const;
}
